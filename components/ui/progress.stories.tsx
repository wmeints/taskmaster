import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Progress } from "./progress"

const meta = {
  title: "Atoms/Progress",
  component: Progress,
  args: { value: 33, "aria-label": "Subtasks done" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33")
  },
}
