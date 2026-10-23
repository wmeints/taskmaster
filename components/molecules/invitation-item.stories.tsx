import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { InvitationItem } from "./invitation-item"

const meta = {
  title: "Molecules/InvitationItem",
  component: InvitationItem,
  args: {
    invitation: { id: "invite-1", listName: "Website relaunch", invitedBy: "Mara Kok" },
    onRespond: fn(async (): Promise<{ error: string } | void> => undefined),
  },
  decorators: [(Story) => <ul className="w-60"><Story /></ul>],
} satisfies Meta<typeof InvitationItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("Website relaunchMara Kok invited youAcceptDecline")
  },
}

export const Accepts: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accept the invite to Website relaunch" }))

    await expect(args.onRespond).toHaveBeenCalledWith(true)
  },
}

export const Declines: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Decline the invite to Website relaunch" }))

    await expect(args.onRespond).toHaveBeenCalledWith(false)
  },
}

// Without a known name the invite still reads well.
export const UnknownInviter: Story = {
  args: { invitation: { id: "invite-1", listName: "Reading", invitedBy: "" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("You're invited")
  },
}

export const ShowsErrors: Story = {
  args: { onRespond: fn(async () => ({ error: "Invalid request" })) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Accept the invite to Website relaunch" }))

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Invalid request")
  },
}
