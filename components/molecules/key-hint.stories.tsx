import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { KeyHint } from "./key-hint"

const meta = {
  title: "Molecules/KeyHint",
  component: KeyHint,
  args: { keys: ["J", "K"], label: "move" },
} satisfies Meta<typeof KeyHint>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("J").tagName).toBe("KBD")
    await expect(canvas.getByText("K").tagName).toBe("KBD")
    await expect(canvas.getByText("move")).toBeInTheDocument()
  },
}

export const Range: Story = {
  args: { keys: ["1", "5"], label: "switch view", range: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("–")).toBeInTheDocument()
  },
}
