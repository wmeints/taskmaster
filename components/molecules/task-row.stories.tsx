import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { TaskRow } from "./task-row"

const meta = {
  title: "Molecules/TaskRow",
  component: TaskRow,
  args: {
    today: "2026-10-21",
    selected: false,
    onSelect: fn(),
    onToggle: fn(),
    task: {
      id: "1",
      title: "Call the plumber about the kitchen tap",
      description: "",
      due: { date: "2026-10-21", time: null },
      list: { id: "l2", name: "Home renovation", color: "orange" },
      completed: false,
      subtasks: [],
    },
  },
  decorators: [(Story) => <ul className="w-xl"><Story /></ul>],
} satisfies Meta<typeof TaskRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveAttribute("data-selected", "false")
    await expect(canvas.getByText("Home renovation")).toBeInTheDocument()
  },
}

export const Selected: Story = {
  args: { selected: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveAttribute("data-selected", "true")
  },
}

export const Completed: Story = {
  args: { task: { ...meta.args.task, completed: true } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: /Mark .* incomplete/ })).toBeChecked()
    await expect(canvas.getByText("Call the plumber about the kitchen tap")).toHaveClass("line-through")
    // Completed rows drop the details.
    await expect(canvas.queryByText("Home renovation")).not.toBeInTheDocument()
  },
}

export const OpensOnClick: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Call the plumber about the kitchen tap" }))

    await expect(args.onSelect).toHaveBeenCalled()
    await expect(args.onToggle).not.toHaveBeenCalled()
  },
}

export const TogglesOnCheckbox: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Mark Call the plumber about the kitchen tap complete" }))

    await expect(args.onToggle).toHaveBeenCalled()
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}
