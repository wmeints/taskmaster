import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test"

import { ShareListDialog } from "./share-list-dialog"

const done = async (): Promise<{ error: string } | void> => undefined

const meta = {
  title: "Organisms/ShareListDialog",
  component: ShareListDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    listName: "Website relaunch",
    owner: { name: "Ada Lovelace", email: "ada@example.com" },
    access: {
      members: [{ id: "user-2", name: "Mara Kok", email: "mara@example.com" }],
      invites: [{ id: "invite-1", email: "joost@example.com", declined: false }],
    },
    onInvite: fn(done),
    onResend: fn(done),
    onRevoke: fn(done),
    onRemove: fn(done),
  },
} satisfies Meta<typeof ShareListDialog>

export default meta

type Story = StoryObj<typeof meta>

async function people() {
  const dialog = await screen.findByRole("dialog", { name: "Share “Website relaunch”" })
  return within(within(dialog).getByRole("list", { name: "People with access" }))
}

export const Default: Story = {
  play: async () => {
    const dialog = await screen.findByRole("dialog", { name: "Share “Website relaunch”" })
    await expect(dialog).toHaveTextContent("People you invite can add, edit, complete and delete tasks in this list.")
    await expect(dialog).toHaveTextContent("Open this dialog with⇧S")

    const rows = (await people()).getAllByRole("listitem")
    await expect(rows.map((row) => row.textContent)).toEqual([
      "AYouada@example.comOwner",
      "MKMara Kokmara@example.comRemove",
      "joost@example.comInvite sent · waiting for replyResendRevoke",
    ])
  },
}

// Only the owner has access until someone is invited.
export const NotSharedYet: Story = {
  args: { access: { members: [], invites: [] } },
  play: async () => {
    await expect((await people()).getAllByRole("listitem")).toHaveLength(1)
  },
}

export const Invites: Story = {
  play: async ({ args }) => {
    await screen.findByRole("dialog")
    await userEvent.type(screen.getByRole("textbox", { name: "Invite by email" }), "lies@example.com{enter}")

    await expect(args.onInvite).toHaveBeenCalledWith({ emails: "lies@example.com" })
  },
}

export const ManagesAccess: Story = {
  play: async ({ args }) => {
    const list = await people()

    await userEvent.click(list.getByRole("button", { name: "Remove Mara Kok" }))
    await expect(args.onRemove).toHaveBeenCalledWith("user-2")

    await userEvent.click(list.getByRole("button", { name: "Resend the invite to joost@example.com" }))
    await expect(args.onResend).toHaveBeenCalledWith("invite-1")

    await userEvent.click(list.getByRole("button", { name: "Revoke the invite to joost@example.com" }))
    await expect(args.onRevoke).toHaveBeenCalledWith("invite-1")
  },
}

// A declined invite says so, and can be sent again.
export const Declined: Story = {
  args: { access: { members: [], invites: [{ id: "invite-1", email: "joost@example.com", declined: true }] } },
  play: async () => {
    const list = await people()
    await expect(list.getAllByRole("listitem")[1]).toHaveTextContent("joost@example.comDeclined the inviteResendRevoke")
  },
}

export const ShowsErrors: Story = {
  args: { onRemove: fn(async () => ({ error: "Invalid request" })) },
  play: async () => {
    const list = await people()

    await userEvent.click(list.getByRole("button", { name: "Remove Mara Kok" }))

    await expect(await screen.findByRole("alert")).toHaveTextContent("Invalid request")
  },
}

export const ClosesWithDone: Story = {
  play: async ({ args }) => {
    await screen.findByRole("dialog")

    await userEvent.click(screen.getByRole("button", { name: "Done" }))

    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything()))
  },
}
