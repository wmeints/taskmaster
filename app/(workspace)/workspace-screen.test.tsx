import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { workspace } from "@/components/organisms/workspace.fixtures"

const { actions, router } = vi.hoisted(() => ({
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
vi.mock("@/app/auth/actions", () => ({ signOut: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/today" }))

import { WorkspaceScreen } from "./workspace-screen"
import { WorkspaceShell } from "./workspace-shell"

const [review, plumber, notes] = workspace.todo
const account = { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") }

// The screen inside the layout's shell, as the app renders it.
function renderScreen(props: Partial<React.ComponentProps<typeof WorkspaceScreen>> = {}) {
  return render(
    <WorkspaceShell overview={workspace} today={workspace.today} account={account}>
      <WorkspaceScreen workspace={workspace} {...props} />
    </WorkspaceShell>,
  )
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
    expect(screen.queryByText("Select a task to see its details")).not.toBeInTheDocument()
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

  it("updates the sidebar counts right away", async () => {
    actions.updateTaskAction.mockReturnValue(new Promise(() => {}))
    renderScreen({ initialTaskId: review.id })
    const todayLink = screen.getByRole("link", { name: /Today/ })
    expect(todayLink).toHaveTextContent(String(workspace.counts.today))

    press("x")

    await waitFor(() => expect(todayLink).toHaveTextContent(String(workspace.counts.today - 1)))
  })

  it("adds a task from search with the quick add field", async () => {
    renderScreen()

    press("k", { metaKey: true })
    await userEvent.click(await screen.findByRole("option", { name: /New task/ }))

    await waitFor(() => expect(screen.getByRole("textbox", { name: "New task" })).toHaveFocus())
  })

  it("edits the open task", async () => {
    renderScreen({ initialTaskId: review.id })

    await userEvent.click(within(detail()!).getByRole("button", { name: "Tomorrow" }))

    expect(actions.updateTaskAction).toHaveBeenCalledWith(review.id, { due: { date: "2026-10-22", time: "14:00" } })
  })
})
