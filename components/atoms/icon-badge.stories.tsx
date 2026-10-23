import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Calendar, Inbox } from "lucide-react"
import { expect } from "storybook/test"

import { IconBadge } from "./icon-badge"

const meta = {
  title: "Atoms/IconBadge",
  component: IconBadge,
  args: {
    icon: Inbox,
  },
} satisfies Meta<typeof IconBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  },
}

export const OtherIcon: Story = {
  args: { icon: Calendar },
}
