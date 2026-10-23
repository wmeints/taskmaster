import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { TaskListSkeleton } from "./task-list-skeleton"

const meta = {
  title: "Organisms/TaskListSkeleton",
  component: TaskListSkeleton,
  decorators: [(Story) => <div className="w-[42rem]"><Story /></div>],
} satisfies Meta<typeof TaskListSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("li")).toHaveLength(5)
    // Placeholders only; screen readers hear the busy state from the surrounding view instead.
    await expect(canvasElement.querySelector("li")?.closest("[aria-hidden=true]")).not.toBeNull()
  },
}
