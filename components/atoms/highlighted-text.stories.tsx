import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { HighlightedText } from "./highlighted-text"

const meta = {
  title: "Atoms/HighlightedText",
  component: HighlightedText,
  args: { text: "Find a dentist near the new place", ranges: [[7, 14]] },
} satisfies Meta<typeof HighlightedText>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("dentist").tagName).toBe("MARK")
    await expect(canvasElement).toHaveTextContent("Find a dentist near the new place")
  },
}

export const SeveralRanges: Story = {
  args: { text: "Plants: plan the plants", ranges: [[0, 6], [8, 12], [17, 23]] },
  play: async ({ canvasElement }) => {
    const marks = [...canvasElement.querySelectorAll("mark")].map((mark) => mark.textContent)
    await expect(marks).toEqual(["Plants", "plan", "plants"])
  },
}

export const NoRanges: Story = {
  args: { ranges: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("mark")).toBeNull()
  },
}
