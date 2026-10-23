import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { TaskDetailEmpty } from "./task-detail-empty"

const meta = {
  title: "Molecules/TaskDetailEmpty",
  component: TaskDetailEmpty,
  decorators: [(Story) => <div className="flex h-[600px] w-90 border-l"><Story /></div>],
} satisfies Meta<typeof TaskDetailEmpty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Select a task to see its details")).toBeInTheDocument()
  },
}
