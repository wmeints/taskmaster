import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { LogoMark } from "./logo-mark"

const meta = {
  title: "Atoms/LogoMark",
  component: LogoMark,
} satisfies Meta<typeof LogoMark>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Decorative: always shown next to text that names the app.
    await expect(canvasElement.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  },
}

export const Large: Story = {
  args: { className: "size-8" },
}
