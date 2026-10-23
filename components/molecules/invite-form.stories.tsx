import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, waitFor } from "storybook/test"

import { InviteForm } from "./invite-form"

const meta = {
  title: "Molecules/InviteForm",
  component: InviteForm,
  args: {
    onInvite: fn(async (): Promise<{ error: string } | void> => undefined),
  },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
} satisfies Meta<typeof InviteForm>

export default meta

type Story = StoryObj<typeof meta>

function emailField(canvas: { getByRole: (role: string, options: { name: string }) => HTMLElement }) {
  return canvas.getByRole("textbox", { name: "Invite by email" })
}

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(emailField(canvas)).toHaveAttribute("placeholder", "name@example.com")
    await expect(canvas.getByText("Separate several addresses with commas. Press Enter to send.")).toBeInTheDocument()
  },
}

// Enter sends the invites and empties the field for the next one.
export const SendsInvites: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(emailField(canvas), "Mara@example.com, joost@example.com{enter}")

    await expect(args.onInvite).toHaveBeenCalledWith({ emails: "mara@example.com, joost@example.com" })
    await waitFor(() => expect(emailField(canvas)).toHaveValue(""))
  },
}

export const SendsWithTheButton: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(emailField(canvas), "mara@example.com")
    await userEvent.click(canvas.getByRole("button", { name: "Send invite" }))

    await expect(args.onInvite).toHaveBeenCalledWith({ emails: "mara@example.com" })
  },
}

export const NamesTheInvalidAddress: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(emailField(canvas), "mara@example.com, joost{enter}")

    await expect(await canvas.findByRole("alert")).toHaveTextContent("“joost” isn't a valid email address")
    await expect(emailField(canvas)).toHaveAttribute("aria-invalid", "true")
    await expect(args.onInvite).not.toHaveBeenCalled()
  },
}

// The server's reply shows under the field, and the addresses stay so they can be fixed.
export const ShowsServerErrors: Story = {
  args: { onInvite: fn(async () => ({ error: "Everyone you entered already has access" })) },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(emailField(canvas), "ada@example.com{enter}")

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Everyone you entered already has access")
    await expect(emailField(canvas)).toHaveValue("ada@example.com")
  },
}
