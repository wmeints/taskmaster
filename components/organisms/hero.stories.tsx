import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Hero } from "./hero"

const meta = {
  title: "Organisms/Hero",
  component: Hero,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof Hero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Get things done, one keystroke at a time." })
    ).toBeInTheDocument()
    await expect(canvas.getByRole("textbox", { name: "Email address" })).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Create account" })).toBeInTheDocument()
    await expect(canvas.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/auth/sign-in")
  },
}
