import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, waitFor } from "storybook/test"

import { MoreMenu } from "./more-menu"

const meta = {
  title: "Organisms/MoreMenu",
  component: MoreMenu,
  args: {
    account: { name: "Ada Lovelace", email: "ada@example.com", createdAt: new Date("2026-10-01T09:30:00Z") },
    signOutAction: fn(async () => {}),
    onSearch: fn(),
    onShowShortcuts: fn(),
  },
  decorators: [(Story) => <div className="w-[390px]"><Story /></div>],
} satisfies Meta<typeof MoreMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Ada Lovelace")).toBeInTheDocument()
    await expect(canvas.getByText("ada@example.com")).toBeInTheDocument()
  },
}

export const OpensSearchAndShortcuts: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search" }))
    await userEvent.click(canvas.getByRole("button", { name: "Keyboard shortcuts" }))

    await expect(args.onSearch).toHaveBeenCalled()
    await expect(args.onShowShortcuts).toHaveBeenCalled()
  },
}

export const SignsOut: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }))

    await waitFor(() => expect(args.signOutAction).toHaveBeenCalled())
  },
}
