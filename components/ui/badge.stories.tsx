import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Badge } from "./badge"

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: {
    children: "Owner",
    variant: "outline",
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Owner")).toBeInTheDocument()
  },
}
