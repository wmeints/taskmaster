import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { SectionHeading } from "./section-heading"

const meta = {
  title: "Molecules/SectionHeading",
  component: SectionHeading,
  args: { title: "To do", count: 3 },
  decorators: [(Story) => <div className="w-xl"><Story /></div>],
} satisfies Meta<typeof SectionHeading>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /To do/ })).toHaveTextContent("3")
  },
}

export const WithAction: Story = {
  args: { title: "Completed", count: 2, action: <button>Hide</button> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Hide" })).toBeInTheDocument()
  },
}
