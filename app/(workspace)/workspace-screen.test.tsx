import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { workspace } from "@/components/organisms/workspace.fixtures"

const { actions, router, signOut } = vi.hoisted(() => ({
  signOut: vi.fn(),
  actions: {
    createTaskAction: vi.fn(),
    updateTaskAction: vi.fn(),
    deleteTaskAction: vi.fn(),
    addSubtaskAction: vi.fn(),
    updateSubtaskAction: vi.fn(),
    deleteSubtaskAction: vi.fn(),
    createListAction: vi.fn(),
  },
  router: { push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() },
}))

vi.mock("./actions", () => actions)
vi.mock("@/app/auth/actions", () => ({ signOut }))
vi.mock("next/navigation", () => ({ useRouter: () => router }))

import { WorkspaceScreen } from "./workspace-screen"

const [review, plumber, notes] = workspace.todo
const account = { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") }

function renderScreen(props: Partial<React.ComponentProps<typeof WorkspaceScreen>> = {}) {
  return render(<WorkspaceScreen workspace={workspace} account={account} {...props} />)
}

function press(key: string, options: KeyboardEventInit = {}) {
  act(() => {
    fireEvent.keyDown(document.body, { key, ...options })
  })
}

function row(title: string) {
  return screen.getByRole("button", { name: title }).closest("li")!
}

function detail() {
  return screen.queryByRole("complementary", { name: "Task details" })
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const action of Object.values(actions)) action.mockResolvedValue(undefined)
  actions.createTaskAction.mockResolvedValue({ id: "new-task" })
  document.cookie = "tz=UTC; path=/"
  // jsdom lacks these browser APIs; the task list and the command menu use them.
  Element.prototype.scrollIntoView = vi.fn()
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe("WorkspaceScreen", () => {
  it("shows the view with its tasks and today's date", () => {
    renderScreen()

    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument()
    expect(screen.getByText("Wednesday 21 October")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: review.title })).toBeInTheDocument()
    expect(detail()).not.toBeInTheDocument()
  })

  it("opens a task given in the URL", () => {
    renderScreen({ initialTaskId: notes.id })

    expect(within(detail()!).getByRole("textbox", { name: "Title" })).toHaveValue(notes.title)
    expect(row(notes.title)).toHaveAttribute("data-selected", "true")
  })

  it("moves the selection with J and K and opens it with Enter", () => {
    renderScreen()

    press("j")
    expect(row(review.title)).toHaveAttribute("data-selected", "true")
    press("j")
    expect(row(plumber.title)).toHaveAttribute("data-selected", "true")
    press("k")
    expect(row(review.title)).toHaveAttribute("data-selected", "true")

    press("Enter")
    expect(within(detail()!).getByRole("textbox", { name: "Title" })).toHaveValue(review.title)

    press("Escape")
    expect(detail()).not.toBeInTheDocument()
  })

  it("opens a task when clicked", async () => {
    renderScreen()

    await userEvent.click(screen.getByRole("button", { name: plumber.title }))

    expect(within(detail()!).getByRole("textbox", { name: "Title" })).toHaveValue(plumber.title)
  })

  it("completes the selected task with X", async () => {
    renderScreen({ initialTaskId: review.id })

    press("x")

    await waitFor(() => expect(actions.updateTaskAction).toHaveBeenCalledWith(review.id, { completed: true }))
  })

  it("deletes the selected task with Backspace and selects the next one", async () => {
    renderScreen({ initialTaskId: review.id })

    press("Backspace")

    await waitFor(() => expect(actions.deleteTaskAction).toHaveBeenCalledWith(review.id))
    expect(detail()).not.toBeInTheDocument()
  })

  it("switches views with the number keys", () => {
    renderScreen()

    press("1")
    press("5")

    expect(router.push).toHaveBeenCalledWith("/inbox")
    expect(router.push).toHaveBeenCalledWith("/later")
  })

  it("focuses the quick add field with N and adds the task to the view", async () => {
    renderScreen()

    press("n")
    const input = screen.getByRole("textbox", { name: "New task" })
    expect(input).toHaveFocus()

    await userEvent.type(input, "Order paint{enter}")

    expect(actions.createTaskAction).toHaveBeenCalledWith({ view: "today" }, { title: "Order paint" })
  })

  it("hides and shows completed tasks with H", () => {
    renderScreen()

    press("h")
    expect(screen.queryByText("Pay the electricity bill")).not.toBeInTheDocument()
    press("h")
    expect(screen.getByText("Pay the electricity bill")).toBeInTheDocument()
  })

  it("jumps to the deadline with D and to subtasks with S", async () => {
    renderScreen()
    press("j")

    press("d")
    await waitFor(() => expect(within(detail()!).getByRole("button", { name: "Today" })).toHaveFocus())

    press("Escape")
    press("s")
    await waitFor(() => expect(within(detail()!).getByRole("textbox", { name: "New subtask" })).toHaveFocus())
  })

  it("opens the shortcuts list with ?", async () => {
    renderScreen()

    press("?", { shiftKey: true })
    expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument()
  })

  it("opens search with ⌘K", async () => {
    renderScreen()

    press("k", { metaKey: true })

    expect(await screen.findByRole("dialog", { name: "Search or command" })).toBeInTheDocument()
  })

  it("edits the open task", async () => {
    renderScreen({ initialTaskId: review.id })

    await userEvent.click(within(detail()!).getByRole("button", { name: "Tomorrow" }))

    expect(actions.updateTaskAction).toHaveBeenCalledWith(review.id, { due: { date: "2026-10-22", time: "14:00" } })
  })

  it("signs out from the account menu", async () => {
    renderScreen()

    await userEvent.click(screen.getByRole("button", { name: /Ada Lovelace/ }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })

  it("stores the browser's time zone and refreshes when it changed", () => {
    document.cookie = "tz=; path=/; max-age=0"
    renderScreen()

    expect(document.cookie).toContain(`tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    expect(router.refresh).toHaveBeenCalled()
  })
})
