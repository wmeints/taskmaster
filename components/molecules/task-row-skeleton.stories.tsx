import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { TaskRowSkeleton } from "./task-row-skeleton"

const meta = {
  title: "Molecules/TaskRowSkeleton",
  component: TaskRowSkeleton,
  args: { titleWidth: "60%", metaWidth: "30%" },
  decorators: [(Story) => <ul className="w-[42rem]"><Story /></ul>],
} satisfies Meta<typeof TaskRowSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
  },
}
