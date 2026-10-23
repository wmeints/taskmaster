import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, waitFor } from "storybook/test"

import { TaskDetail } from "./task-detail"
import { lists, reviewTask, today } from "./workspace.fixtures"

const meta = {
  title: "Organisms/TaskDetail",
  component: TaskDetail,
  args: {
    task: reviewTask,
    lists,
    today,
    breadcrumb: "Website relaunch / Today",
    onClose: fn(),
    onChange: fn(async () => undefined),
    onDelete: fn(),
    onAddSubtask: fn(async () => undefined),
    onToggleSubtask: fn(),
    onDeleteSubtask: fn(),
  },
  decorators: [(Story) => <div className="flex h-[900px] w-90 border-l"><Story /></div>],
} satisfies Meta<typeof TaskDetail>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Website relaunch / Today")).toBeInTheDocument()
    await expect(canvas.getByRole("textbox", { name: "Title" })).toHaveValue(reviewTask.title)
    await expect(canvas.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByRole("combobox", { name: "List" })).toHaveValue(lists[0].id)
    await expect(canvas.getByText(/1 of 3 done/)).toBeInTheDocument()
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33")
  },
}

export const ChangesTheDeadline: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Tomorrow" }))

    await expect(args.onChange).toHaveBeenCalledWith({ due: { date: "2026-10-22", time: "14:00" } })
  },
}

export const MovesToAnotherList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "List" }), "Home renovation")
    await expect(args.onChange).toHaveBeenCalledWith({ listId: lists[1].id })

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "List" }), "No list")
    await expect(args.onChange).toHaveBeenLastCalledWith({ listId: null })
  },
}

export const SavesTheTitle: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), " today{enter}")

    await waitFor(() =>
      expect(args.onChange).toHaveBeenCalledWith({
        title: `${reviewTask.title} today`,
        description: reviewTask.description,
      })
    )
  },
}

export const ManagesSubtasks: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Check payment error states" }))
    await expect(args.onToggleSubtask).toHaveBeenCalledWith(reviewTask.subtasks[1].id, true)

    await userEvent.click(canvas.getByRole("button", { name: "Delete subtask Leave review comments" }))
    await expect(args.onDeleteSubtask).toHaveBeenCalledWith(reviewTask.subtasks[2].id)

    await userEvent.type(canvas.getByRole("textbox", { name: "New subtask" }), "Approve{enter}")
    await expect(args.onAddSubtask).toHaveBeenCalledWith({ title: "Approve" })
  },
}

export const CompletesAndDeletes: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Mark complete" }))
    await expect(args.onChange).toHaveBeenCalledWith({ completed: true })

    await userEvent.click(canvas.getByRole("button", { name: "Delete" }))
    await expect(args.onDelete).toHaveBeenCalled()

    await userEvent.click(canvas.getByRole("button", { name: "Close" }))
    await expect(args.onClose).toHaveBeenCalled()
  },
}

export const Completed: Story = {
  args: { task: { ...reviewTask, completed: true } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Mark incomplete" }))

    await expect(args.onChange).toHaveBeenCalledWith({ completed: false })
  },
}

export const WithoutSubtasks: Story = {
  args: { task: { ...reviewTask, subtasks: [] } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("progressbar")).not.toBeInTheDocument()
    await expect(canvas.getByRole("textbox", { name: "New subtask" })).toBeInTheDocument()
  },
}
