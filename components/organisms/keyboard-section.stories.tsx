import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { KeyboardSection } from "./keyboard-section"

const meta = {
  title: "Organisms/KeyboardSection",
  component: KeyboardSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof KeyboardSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const section = canvasElement.querySelector("section")

    await expect(section).toHaveAttribute("id", "keyboard")
    await expect(section).toHaveClass("dark")

    const shortcuts = canvas.getByRole("list", { name: "Keyboard shortcuts" })
    await expect(shortcuts.querySelectorAll("li")).toHaveLength(8)
    await expect(canvas.getByText("Command palette")).toBeInTheDocument()
  },
}
