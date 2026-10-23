import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ListDot } from "./list-dot"

const meta = {
  title: "Atoms/ListDot",
  component: ListDot,
  args: { color: "blue" },
} satisfies Meta<typeof ListDot>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector("span")
    // Decorative: always shown next to the list's name.
    await expect(dot).toHaveAttribute("aria-hidden", "true")
    await expect(dot).toHaveClass("bg-blue-500")
  },
}

export const Orange: Story = {
  args: { color: "orange" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("span")).toHaveClass("bg-orange-500")
  },
}
