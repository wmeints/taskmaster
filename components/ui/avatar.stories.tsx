import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Avatar, AvatarFallback } from "./avatar"

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  render: () => (
    <Avatar>
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("AL")).toBeInTheDocument()
  },
}
