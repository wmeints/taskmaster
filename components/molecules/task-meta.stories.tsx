import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { TaskMeta } from "./task-meta"

const meta = {
  title: "Molecules/TaskMeta",
  component: TaskMeta,
  args: {
    today: "2026-10-21",
    task: {
      id: "1",
      title: "Review pull request for checkout flow",
      description: "Focus on the payment error states.",
      due: { date: "2026-10-21", time: "14:00" },
      list: { id: "l1", name: "Website relaunch", color: "blue" },
      completed: false,
      subtasks: [
        { id: "s1", title: "Run the branch locally", done: true },
        { id: "s2", title: "Check payment error states", done: false },
        { id: "s3", title: "Leave review comments", done: false },
      ],
    },
  },
} satisfies Meta<typeof TaskMeta>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Today, 14:00")).toBeInTheDocument()
    await expect(canvas.getByText("Website relaunch")).toBeInTheDocument()
    await expect(canvas.getByText("1/3")).toBeInTheDocument()
    await expect(canvas.getByTitle("Subtasks done")).toBeInTheDocument()
    await expect(canvas.getByTitle("Has a description")).toBeInTheDocument()
  },
}

export const Overdue: Story = {
  args: {
    task: { ...meta.args.task, due: { date: "2026-10-19", time: null } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Mon 19 Oct")).toHaveClass("text-destructive")
  },
}

export const Minimal: Story = {
  args: {
    task: { ...meta.args.task, due: null, list: null, description: "", subtasks: [] },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeEmptyDOMElement()
  },
}
