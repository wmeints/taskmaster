import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Logo } from "./logo"

const meta = {
  title: "Molecules/Logo",
  component: Logo,
} satisfies Meta<typeof Logo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Taskmaster" })).toHaveAttribute("href", "/")
  },
}

export const CustomHref: Story = {
  args: { href: "/today" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Taskmaster" })).toHaveAttribute("href", "/today")
  },
}
