import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { ShortcutsDialog } from "./shortcuts-dialog"

const meta = {
  title: "Organisms/ShortcutsDialog",
  component: ShortcutsDialog,
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof ShortcutsDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" })
    await expect(dialog).toHaveTextContent("Mark complete")
    await expect(dialog).toHaveTextContent("Search or run a command")

    await userEvent.keyboard("{Escape}")

    await expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  },
}
