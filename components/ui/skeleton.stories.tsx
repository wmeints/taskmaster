import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Skeleton } from "./skeleton"

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  args: { className: "h-3 w-48", "aria-label": "Placeholder" },
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Placeholder")).toHaveClass("animate-pulse")
  },
}
