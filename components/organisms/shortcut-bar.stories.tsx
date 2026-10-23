import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ShortcutBar } from "./shortcut-bar"

const meta = {
  title: "Organisms/ShortcutBar",
  component: ShortcutBar,
} satisfies Meta<typeof ShortcutBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    for (const label of ["move", "open", "complete", "deadline", "delete", "switch view", "all shortcuts"]) {
      await expect(canvas.getByText(label)).toBeInTheDocument()
    }
  },
}
