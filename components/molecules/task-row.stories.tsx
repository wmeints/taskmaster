import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fireEvent, fn } from "storybook/test"

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

// Swiping a row to the left on a touch screen reveals a delete button.
function swipe(row: HTMLElement, distance: number) {
  const options = { pointerId: 1, pointerType: "touch", isPrimary: true, clientY: 20 }
  fireEvent.pointerDown(row, { ...options, clientX: 400 })
  for (let x = 400; x >= 400 - distance; x -= 20) fireEvent.pointerMove(row, { ...options, clientX: x })
  fireEvent.pointerUp(row, { ...options, clientX: 400 - distance })
}

export const SwipesToDelete: Story = {
  args: { onDelete: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()

    swipe(canvas.getByRole("listitem"), 120)
    await userEvent.click(await canvas.findByRole("button", { name: "Delete" }))

    await expect(args.onDelete).toHaveBeenCalled()
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

export const ShortSwipeSnapsBack: Story = {
  args: { onDelete: fn() },
  play: async ({ args, canvas }) => {
    swipe(canvas.getByRole("listitem"), 20)

    await expect(canvas.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

export const TapClosesTheSwipe: Story = {
  args: { onDelete: fn() },
  play: async ({ args, canvas, userEvent }) => {
    swipe(canvas.getByRole("listitem"), 120)
    await userEvent.click(canvas.getByRole("button", { name: "Call the plumber about the kitchen tap" }))

    await expect(canvas.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

// A mouse drag doesn't swipe: desktop has the delete key and the details panel.
export const IgnoresMouseDrags: Story = {
  args: { onDelete: fn() },
  play: async ({ canvas }) => {
      const row = canvas.getByRole("listitem")
    const options = { pointerId: 1, pointerType: "mouse", clientY: 20 }
    fireEvent.pointerDown(row, { ...options, clientX: 400 })
    fireEvent.pointerMove(row, { ...options, clientX: 250 })
    fireEvent.pointerUp(row, { ...options, clientX: 250 })

    await expect(canvas.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()
  },
}
