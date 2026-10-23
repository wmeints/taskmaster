import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { CountBadge } from "./count-badge"

const meta = {
  title: "Atoms/CountBadge",
  component: CountBadge,
  args: { count: 3 },
} satisfies Meta<typeof CountBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3")).toBeInTheDocument()
  },
}
