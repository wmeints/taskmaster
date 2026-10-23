import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ShortcutRow } from "./shortcut-row"

const meta = {
  title: "Molecules/ShortcutRow",
  component: ShortcutRow,
  args: { label: "Next task", keys: ["J"] },
  decorators: [(Story) => <ul className="w-64"><Story /></ul>],
} satisfies Meta<typeof ShortcutRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const row = canvas.getByRole("listitem")
    await expect(row).toHaveTextContent("Next task")
    await expect(row.querySelectorAll("[data-slot=kbd]")).toHaveLength(1)
  },
}

// A combination: each key gets its own cap.
export const Combination: Story = {
  args: { label: "Command palette", keys: ["⌘", "K"] },
  play: async ({ canvas }) => {
    const keys = canvas.getByRole("listitem").querySelectorAll("[data-slot=kbd]")
    await expect([...keys].map((key) => key.textContent)).toEqual(["⌘", "K"])
  },
}
