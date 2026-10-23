import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { workspace } from "@/components/organisms/workspace.fixtures"

const { actions, navigation, router, signOut } = vi.hoisted(() => ({
  signOut: vi.fn(),
  actions: { createListAction: vi.fn() },
  router: { push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), prefetch: vi.fn() },
  navigation: { pathname: "/today" },
}))

vi.mock("./actions", () => actions)
vi.mock("@/app/auth/actions", () => ({ signOut }))
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => navigation.pathname }))
// A client-side navigation, as next/link performs it in the app.
vi.mock("next/link", () => ({
  default: ({ href, onNavigate, children, ...props }: React.ComponentProps<"a"> & { onNavigate?: (e: Event) => void }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault()
        onNavigate?.(new Event("navigate"))
      }}
    >
      {children}
    </a>
  ),
}))

import { WorkspaceShell } from "./workspace-shell"

const account = { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") }

function renderShell() {
  return render(
    <WorkspaceShell overview={workspace} today={workspace.today} account={account}>
      <p>The view</p>
    </WorkspaceShell>,
  )
}

let finishNavigation = () => {}

// Keeps navigations pending, the way a slow server would, until the test ends. (React entangles pending
// transitions, so one left hanging would hold up the next test's navigations too.)
function slowNavigation() {
  router.push.mockReturnValue(new Promise<void>((resolve) => (finishNavigation = resolve)))
}

function press(key: string, options: KeyboardEventInit = {}) {
  act(() => {
    fireEvent.keyDown(document.body, { key, ...options })
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  router.push.mockReturnValue(undefined)
  navigation.pathname = "/today"
  document.cookie = "tz=UTC; path=/"
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(async () => {
  await act(async () => finishNavigation())
})

describe("WorkspaceShell", () => {
  it("shows the sidebar next to the view", () => {
    renderShell()

    expect(screen.getByText("The view")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Website relaunch/ })).toBeInTheDocument()
  })

  it("marks the view or list in the URL as current", () => {
    navigation.pathname = `/lists/${workspace.lists[1].id}`
    renderShell()

    expect(screen.getByRole("link", { name: /Home renovation/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: /Today/ })).not.toHaveAttribute("aria-current")
  })

  it("shows the clicked view loading until it arrives", async () => {
    slowNavigation()
    renderShell()

    await userEvent.click(screen.getByRole("link", { name: /Tomorrow/ }))

    expect(router.push).toHaveBeenCalledWith("/tomorrow")
    expect(screen.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
    expect(screen.getByText("Thursday 22 October")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument()
    expect(screen.queryByText("The view")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-busy", "true")
  })

  it("shows a list loading with its number of open tasks", async () => {
    slowNavigation()
    renderShell()
    const [list] = workspace.lists

    await userEvent.click(screen.getByRole("link", { name: new RegExp(list.name) }))

    expect(screen.getByRole("heading", { level: 1, name: list.name })).toBeInTheDocument()
    expect(screen.getByText(`${list.openCount} open tasks`)).toBeInTheDocument()
  })

  it("shows the view again once navigation finishes", async () => {
    router.push.mockReturnValue(undefined)
    renderShell()

    await userEvent.click(screen.getByRole("link", { name: /Tomorrow/ }))

    expect(await screen.findByText("The view")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("switches views with the number keys", () => {
    renderShell()

    press("1")
    press("5")

    expect(router.push).toHaveBeenCalledWith("/inbox")
    expect(router.push).toHaveBeenCalledWith("/later")
  })

  it("shows the view loading when switching with a number key", () => {
    slowNavigation()
    renderShell()

    press("3")

    expect(screen.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
  })

  it("opens the shortcuts list with ?", async () => {
    renderShell()

    press("?", { shiftKey: true })

    expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument()
  })

  it("opens search with ⌘K", async () => {
    renderShell()

    press("k", { metaKey: true })
    expect(await screen.findByRole("dialog", { name: "Search or command" })).toBeInTheDocument()
  })

  it("opens a new list after creating it", async () => {
    actions.createListAction.mockResolvedValue({ id: "new-list" })
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: "New list" }))
    await userEvent.type(screen.getByRole("textbox"), "Garden{enter}")

    expect(actions.createListAction).toHaveBeenCalledWith({ name: "Garden" })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/lists/new-list"))
  })

  it("signs out from the account menu", async () => {
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: /Ada Lovelace/ }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })

  it("stores the browser's time zone and refreshes when it changed", () => {
    document.cookie = "tz=; path=/; max-age=0"
    renderShell()

    expect(document.cookie).toContain(`tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    expect(router.refresh).toHaveBeenCalled()
  })
})
