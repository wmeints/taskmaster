import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, waitFor } from "storybook/test"

import { AppSidebar } from "./app-sidebar"
import { lists, workspace } from "./workspace.fixtures"

const meta = {
  title: "Organisms/AppSidebar",
  component: AppSidebar,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    counts: workspace.counts,
    lists,
    scope: { view: "today" },
    account: { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") },
    signOutAction: fn(async () => {}),
    onSearch: fn(),
    onShowShortcuts: fn(),
    onCreateList: fn(async () => ({ id: "new-list" })),
  },
  decorators: [(Story) => <div className="flex h-[900px] w-60 border-r bg-sidebar"><Story /></div>],
} satisfies Meta<typeof AppSidebar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const views = canvas.getByRole("navigation", { name: "Views" })
    await expect(views).toHaveTextContent(/Inbox.*Today.*Tomorrow.*End of week.*Later/)
    await expect(canvas.getByRole("link", { name: /Today/ })).toHaveAttribute("aria-current", "page")
    await expect(canvas.getByRole("link", { name: /Website relaunch/ })).toHaveAttribute("href", `/lists/${lists[0].id}`)
  },
}

export const ActiveList: Story = {
  args: { scope: { listId: lists[1].id } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Home renovation/ })).toHaveAttribute("aria-current", "page")
    await expect(canvas.getByRole("link", { name: /Today/ })).not.toHaveAttribute("aria-current")
  },
}

export const OpensSearchAndShortcuts: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search or command…" }))
    await userEvent.click(canvas.getByRole("button", { name: "Keyboard shortcuts" }))

    await expect(args.onSearch).toHaveBeenCalled()
    await expect(args.onShowShortcuts).toHaveBeenCalled()
  },
}

export const CreatesAList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New list" }))
    await userEvent.type(canvas.getByRole("textbox", { name: "List name" }), "Groceries{enter}")

    await expect(args.onCreateList).toHaveBeenCalledWith({ name: "Groceries" })
    await expect(canvas.queryByRole("textbox", { name: "List name" })).not.toBeInTheDocument()
  },
}

export const SignsOutFromTheAccountMenu: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Ada Lovelace/ }))
    await expect(await screen.findByRole("menu")).toHaveTextContent("ada@example.com")

    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => expect(args.signOutAction).toHaveBeenCalled())
  },
}

// Just clicked Tomorrow: it is highlighted and shows a spinner while the view loads.
export const Pending: Story = {
  args: { scope: { view: "tomorrow" }, pending: true },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /Tomorrow/ })
    await expect(link).toHaveAttribute("aria-current", "page")
    await expect(link).toHaveAttribute("aria-busy", "true")
    await expect(canvas.getByRole("link", { name: /Today/ })).not.toHaveAttribute("aria-busy")
  },
}

export const DeletesList: Story = {
  args: { onDeleteList: fn(async () => undefined) },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Actions for ${lists[1].name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Delete list" }))

    await expect(args.onDeleteList).toHaveBeenCalledWith(lists[1].id)
  },
}
