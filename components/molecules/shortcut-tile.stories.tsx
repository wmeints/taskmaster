import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ShortcutTile } from "./shortcut-tile"

const meta = {
  title: "Molecules/ShortcutTile",
  component: ShortcutTile,
  decorators: [
    (Story) => (
      <ul className="max-w-xs">
        <Story />
      </ul>
    ),
  ],
  args: {
    keys: "N",
    action: "New task",
  },
} satisfies Meta<typeof ShortcutTile>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const tile = canvas.getByRole("listitem")

    await expect(tile).toHaveTextContent("New task")
    await expect(tile.querySelector("kbd")).toHaveTextContent("N")
  },
}

export const OnDark: Story = {
  args: { keys: "⌘K", action: "Command palette" },
  decorators: [
    (Story) => (
      <div className="dark bg-background p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
}
