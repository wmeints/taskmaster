import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { FeaturesSection } from "./features-section"

const meta = {
  title: "Organisms/FeaturesSection",
  component: FeaturesSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FeaturesSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector("section")).toHaveAttribute("id", "features")
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Everything a todo app needs."
    )
    await expect(canvas.getAllByRole("article")).toHaveLength(6)
  },
}
