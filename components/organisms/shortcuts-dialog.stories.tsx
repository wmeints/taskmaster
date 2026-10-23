import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, userEvent, within } from "storybook/test"

import { ShortcutsDialog } from "./shortcuts-dialog"

const meta = {
  title: "Organisms/ShortcutsDialog",
  component: ShortcutsDialog,
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof ShortcutsDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args }) => {
    const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" })
    await expect(dialog).toHaveTextContent("Single keys work whenever you are not typing in a field.")

    await userEvent.keyboard("{Escape}")

    await expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  },
}

// Grouped in three columns, each shortcut on its own row.
export const Groups: Story = {
  play: async () => {
    const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" })
    const group = (name: string) => within(within(dialog).getByRole("region", { name }))

    await expect(group("Navigate").getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Next taskJ",
      "Previous taskK",
      "Open details↵",
      "Close or go backEsc",
      "Inbox1",
      "Today2",
      "Tomorrow3",
      "End of week4",
      "Later5",
    ])
    await expect(group("Tasks").getByText("Complete or reopen")).toBeInTheDocument()
    await expect(group("Lists and views").getByText("Command palette")).toBeInTheDocument()
  },
}

export const ClosesWithTheButton: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByRole("button", { name: "Close" }))

    await expect(args.onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  },
}
