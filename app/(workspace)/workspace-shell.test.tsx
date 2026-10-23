import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { sharedList, workspace } from "@/components/organisms/workspace.fixtures"
import type { Sharing } from "@/lib/sharing/types"

const { actions, navigation, router, signOut } = vi.hoisted(() => ({
  signOut: vi.fn(),
  actions: {
    createListAction: vi.fn(),
    deleteListAction: vi.fn(),
    quickAddTaskAction: vi.fn(),
    inviteToListAction: vi.fn(),
    resendInviteAction: vi.fn(),
    revokeInviteAction: vi.fn(),
    removeMemberAction: vi.fn(),
    respondToInvitationAction: vi.fn(),
    leaveListAction: vi.fn(),
  },
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

const noSharing: Sharing = { invitations: [], lists: {} }

function renderShell({ overview = workspace, sharing = noSharing } = {}) {
  return render(
    <WorkspaceShell overview={overview} today={workspace.today} account={account} sharing={sharing}>
      <p>The view</p>
    </WorkspaceShell>,
  )
}

// A view in the sidebar; small screens show some of them as pills and tabs too.
function sidebarView(name: RegExp) {
  return within(screen.getByRole("navigation", { name: "Views" })).getByRole("link", { name })
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
    expect(sidebarView(/Today/)).not.toHaveAttribute("aria-current")
  })

  it("shows the clicked view loading until it arrives", async () => {
    slowNavigation()
    renderShell()

    await userEvent.click(sidebarView(/Tomorrow/))

    expect(router.push).toHaveBeenCalledWith("/tomorrow")
    expect(screen.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
    expect(screen.getByText("Thursday 22 October")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument()
    expect(screen.queryByText("The view")).not.toBeInTheDocument()
    expect(sidebarView(/Tomorrow/)).toHaveAttribute("aria-current", "page")
    expect(sidebarView(/Tomorrow/)).toHaveAttribute("aria-busy", "true")
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

    await userEvent.click(sidebarView(/Tomorrow/))

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

  it("adds a task typed into search, with its deadline and list", async () => {
    actions.quickAddTaskAction.mockResolvedValue({ id: "new-task" })
    renderShell()

    press("k", { metaKey: true })
    await userEvent.type(await screen.findByRole("combobox"), "Call the dentist tomorrow #home{enter}")

    expect(actions.quickAddTaskAction).toHaveBeenCalledWith({
      title: "Call the dentist",
      due: { date: "2026-10-22", time: null },
      listId: workspace.lists[1].id,
    })
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Search or command" })).not.toBeInTheDocument())
  })

  it("opens a task added from search with ⌘↵", async () => {
    actions.quickAddTaskAction.mockResolvedValue({ id: "new-task" })
    renderShell()

    press("k", { metaKey: true })
    await userEvent.type(await screen.findByRole("combobox"), "Water the plants fri")
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}")

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/end-of-week?task=new-task"))
  })

  it("opens a new list after creating it", async () => {
    actions.createListAction.mockResolvedValue({ id: "new-list" })
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: "New list" }))
    await userEvent.type(screen.getByRole("textbox"), "Garden{enter}")

    expect(actions.createListAction).toHaveBeenCalledWith({ name: "Garden" })
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/lists/new-list"))
  })

  it("deletes a list once the user confirms", async () => {
    const [list, other] = workspace.lists
    navigation.pathname = `/lists/${other.id}`
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: `Actions for ${list.name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
    expect(actions.deleteListAction).not.toHaveBeenCalled()
    await userEvent.click(await screen.findByRole("button", { name: "Delete list" }))

    await waitFor(() => expect(actions.deleteListAction).toHaveBeenCalledWith(list.id, { leave: false }))
  })

  it("leaves the list being viewed when deleting it", async () => {
    const [list] = workspace.lists
    navigation.pathname = `/lists/${list.id}`
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: `Actions for ${list.name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Delete list" }))

    await waitFor(() => expect(actions.deleteListAction).toHaveBeenCalledWith(list.id, { leave: true }))
  })

  describe("sharing", () => {
    const [list] = workspace.lists
    const sharing: Sharing = {
      invitations: [{ id: "55555555-5555-4555-8555-555555555555", listName: "Garden", invitedBy: "Mara Kok" }],
      lists: {
        [list.id]: { members: [{ id: "user-2", name: "Mara Kok", email: "mara@example.com" }], invites: [] },
      },
    }

    it("shares a list from its actions menu", async () => {
      renderShell({ sharing })

      await userEvent.click(screen.getByRole("button", { name: `Actions for ${list.name}` }))
      await userEvent.click(await screen.findByRole("menuitem", { name: "Share list…" }))

      const dialog = await screen.findByRole("dialog", { name: `Share “${list.name}”` })
      expect(within(dialog).getByText("ada@example.com")).toBeInTheDocument()
      expect(within(dialog).getByText("Mara Kok")).toBeInTheDocument()
    })

    it("opens the share dialog of the list on screen with ⇧S", async () => {
      navigation.pathname = `/lists/${list.id}`
      renderShell()

      press("S", { shiftKey: true })

      expect(await screen.findByRole("dialog", { name: `Share “${list.name}”` })).toBeInTheDocument()
    })

    it("ignores ⇧S outside the user's own lists", () => {
      navigation.pathname = `/lists/${sharedList.id}`
      renderShell({ overview: { ...workspace, lists: [...workspace.lists, sharedList] } })

      press("S", { shiftKey: true })
      navigation.pathname = "/today"
      press("S", { shiftKey: true })

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("invites people to the list", async () => {
      actions.inviteToListAction.mockResolvedValue(undefined)
      navigation.pathname = `/lists/${list.id}`
      renderShell()

      press("S", { shiftKey: true })
      await userEvent.type(await screen.findByRole("textbox", { name: "Invite by email" }), "joost@example.com{enter}")

      expect(actions.inviteToListAction).toHaveBeenCalledWith(list.id, { emails: "joost@example.com" })
    })

    it("answers invitations from the sidebar", async () => {
      renderShell({ sharing })

      await userEvent.click(screen.getAllByRole("button", { name: "Accept the invite to Garden" })[0])

      expect(actions.respondToInvitationAction).toHaveBeenCalledWith(sharing.invitations[0].id, { accept: true })
    })

    it("leaves a list shared with the user, going to the inbox when it is on screen", async () => {
      navigation.pathname = `/lists/${sharedList.id}`
      renderShell({ overview: { ...workspace, lists: [...workspace.lists, sharedList] } })

      await userEvent.click(screen.getAllByRole("button", { name: `Actions for ${sharedList.name}` })[0])
      await userEvent.click(await screen.findByRole("menuitem", { name: "Leave list…" }))
      await userEvent.click(await screen.findByRole("button", { name: "Leave list" }))

      await waitFor(() => expect(actions.leaveListAction).toHaveBeenCalledWith(sharedList.id, { leave: true }))
    })
  })

  it("signs out from the account menu", async () => {
    renderShell()

    await userEvent.click(screen.getByRole("button", { name: /Ada Lovelace/ }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })

  describe("on small screens", () => {
    it("opens a menu with every view and list, which closes on navigating", async () => {
      renderShell()

      await userEvent.click(screen.getByRole("button", { name: "Open menu" }))
      const menu = await screen.findByRole("dialog", { name: "Menu" })
      await userEvent.click(within(menu).getByRole("link", { name: /Website relaunch/ }))

      expect(router.push).toHaveBeenCalledWith(`/lists/${workspace.lists[0].id}`)
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument())
    })

    it("opens search from the top bar", async () => {
      renderShell()

      await userEvent.click(screen.getByRole("button", { name: "Search" }))

      expect(await screen.findByRole("dialog", { name: "Search or command" })).toBeInTheDocument()
    })

    it("marks the tab of the view on screen", () => {
      renderShell()
      const tabs = within(screen.getByRole("navigation", { name: "Sections" }))

      expect(tabs.getByRole("link", { name: "Planner" })).toHaveAttribute("aria-current", "page")
      expect(tabs.getByRole("link", { name: "Inbox" })).not.toHaveAttribute("aria-current")
    })

    it("marks the lists tab in a list", () => {
      navigation.pathname = `/lists/${workspace.lists[0].id}`
      renderShell()
      const tabs = within(screen.getByRole("navigation", { name: "Sections" }))

      expect(tabs.getByRole("button", { name: "Lists" })).toHaveAttribute("data-active", "true")
      expect(tabs.getByRole("link", { name: "Planner" })).not.toHaveAttribute("aria-current")
    })

    it("opens the inbox from the tabs", async () => {
      renderShell()

      await userEvent.click(within(screen.getByRole("navigation", { name: "Sections" })).getByRole("link", { name: "Inbox" }))

      expect(router.push).toHaveBeenCalledWith("/inbox")
    })

    it("shows the lists in a sheet", async () => {
      renderShell()

      await userEvent.click(screen.getByRole("button", { name: "Lists" }))
      const sheet = await screen.findByRole("dialog", { name: "Lists" })
      await userEvent.click(within(sheet).getByRole("link", { name: /Home renovation/ }))

      expect(router.push).toHaveBeenCalledWith(`/lists/${workspace.lists[1].id}`)
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Lists" })).not.toBeInTheDocument())
    })

    it("shows search, the shortcuts and the account under More", async () => {
      renderShell()

      await userEvent.click(screen.getByRole("button", { name: "More" }))
      const sheet = await screen.findByRole("dialog", { name: "More" })
      expect(within(sheet).getByText("ada@example.com")).toBeInTheDocument()
      await userEvent.click(within(sheet).getByRole("button", { name: "Keyboard shortcuts" }))

      expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument()
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "More" })).not.toBeInTheDocument())
    })

    it("keeps the planner's pills while the next view loads", async () => {
      slowNavigation()
      renderShell()

      press("3")

      const pills = within(screen.getByRole("navigation", { name: "Planner" }))
      expect(pills.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-busy", "true")
    })
  })

  it("stores the browser's time zone and refreshes when it changed", () => {
    document.cookie = "tz=; path=/; max-age=0"
    renderShell()

    expect(document.cookie).toContain(`tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    expect(router.refresh).toHaveBeenCalled()
  })
})
