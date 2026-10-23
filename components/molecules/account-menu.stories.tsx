import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, waitFor } from "storybook/test"

import { AccountMenu } from "./account-menu"

const meta = {
  title: "Molecules/AccountMenu",
  component: AccountMenu,
  args: {
    account: { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") },
    signOutAction: fn(async () => {}),
  },
  decorators: [(Story) => <div className="flex h-80 w-56 items-end"><Story /></div>],
} satisfies Meta<typeof AccountMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: /Ada Lovelace/ })
    await expect(trigger).toHaveTextContent("A")
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    await expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  },
}

export const ShowsTheAccountSummary: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Ada Lovelace/ }))

    const menu = await screen.findByRole("menu")
    await expect(menu).toHaveTextContent("ada@example.com")
    await expect(menu).toHaveTextContent("Member since 1 October 2026")
  },
}

export const UnknownCreationDate: Story = {
  args: { account: { name: "Ada Lovelace", email: "ada@example.com", createdAt: null } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Ada Lovelace/ }))

    await expect(await screen.findByRole("menu")).not.toHaveTextContent("Member since")
  },
}

export const SignsOut: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Ada Lovelace/ }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => expect(args.signOutAction).toHaveBeenCalled())
  },
}

export const OpensWithTheKeyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("button", { name: /Ada Lovelace/ }).focus()
    await userEvent.keyboard("{Enter}")

    await expect(await screen.findByRole("menuitem", { name: "Sign out" })).toBeInTheDocument()
  },
}
