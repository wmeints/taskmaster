import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Separator } from "./separator"

const meta = {
  title: "Atoms/Separator",
  component: Separator,
  decorators: [
    (Story) => (
      <div className="flex h-10 w-64 items-center gap-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal")
  },
}

export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical")
  },
}
