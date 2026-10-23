import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { ListNav } from "./list-nav"
import { lists, sharedList } from "./workspace.fixtures"

const meta = {
  title: "Organisms/ListNav",
  component: ListNav,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    lists,
    scope: { listId: lists[0].id },
    onCreateList: fn(async () => ({ id: "new-list" })),
    onShareList: fn(),
    onDeleteList: fn(async () => undefined),
    onLeaveList: fn(async () => undefined),
    onRespondToInvitation: fn(async () => undefined),
  },
  decorators: [(Story) => <div className="w-60"><Story /></div>],
} satisfies Meta<typeof ListNav>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Lists" })
    await expect(nav).toHaveTextContent(/Website relaunch.*Home renovation.*Reading/)
    await expect(canvas.getByRole("link", { name: /Website relaunch/ })).toHaveAttribute("aria-current", "page")
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

export const DeletesList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Actions for ${lists[2].name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Delete list" }))

    await expect(args.onDeleteList).toHaveBeenCalledWith(lists[2].id)
  },
}

export const SharesList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Actions for ${lists[0].name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Share list…" }))

    await expect(args.onShareList).toHaveBeenCalledWith(lists[0].id)
  },
}

// A list someone else shared can only be left.
export const LeavesSharedList: Story = {
  args: { lists: [...lists, sharedList] },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Actions for ${sharedList.name}` }))
    await expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual(["Leave list…"])
    await userEvent.click(screen.getByRole("menuitem", { name: "Leave list…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Leave list" }))

    await expect(args.onLeaveList).toHaveBeenCalledWith(sharedList.id)
  },
}

// Invitations wait above the lists until they are answered.
export const Invitations: Story = {
  args: { invitations: [{ id: "invite-1", listName: "Team offsite", invitedBy: "Mara Kok" }] },
  play: async ({ args, canvas, userEvent }) => {
    const invitations = canvas.getByRole("list", { name: "Invitations" })
    await expect(invitations).toHaveTextContent("Team offsiteMara Kok invited you")

    await userEvent.click(canvas.getByRole("button", { name: "Accept the invite to Team offsite" }))

    await expect(args.onRespondToInvitation).toHaveBeenCalledWith("invite-1", true)
  },
}
