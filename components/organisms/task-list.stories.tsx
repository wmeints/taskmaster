import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, within } from "storybook/test"

import { TaskList } from "./task-list"
import { completed, today, todo } from "./workspace.fixtures"

const meta = {
  title: "Organisms/TaskList",
  component: TaskList,
  args: {
    todo,
    completed,
    today,
    selectedId: todo[0].id,
    hideCompleted: false,
    onToggleHideCompleted: fn(),
    onSelect: fn(),
    onToggle: fn(),
  },
  decorators: [(Story) => <div className="w-2xl"><Story /></div>],
} satisfies Meta<typeof TaskList>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const toDo = canvas.getByRole("region", { name: /To do/ })
    await expect(within(toDo).getAllByRole("listitem")).toHaveLength(3)
    await expect(within(toDo).getAllByRole("listitem")[0]).toHaveAttribute("data-selected", "true")

    const done = canvas.getByRole("region", { name: /Completed/ })
    await expect(within(done).getAllByRole("listitem")).toHaveLength(2)
  },
}

export const SelectsAndCompletes: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Draft release notes" }))
    await expect(args.onSelect).toHaveBeenCalledWith(todo[2].id)

    await userEvent.click(canvas.getByRole("checkbox", { name: "Mark Draft release notes complete" }))
    await expect(args.onToggle).toHaveBeenCalledWith(todo[2].id, true)
  },
}

export const HidesCompleted: Story = {
  args: { hideCompleted: true },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.queryByText("Pay the electricity bill")).not.toBeInTheDocument()

    await userEvent.click(canvas.getByRole("button", { name: "Show" }))

    await expect(args.onToggleHideCompleted).toHaveBeenCalled()
  },
}

export const Empty: Story = {
  args: { todo: [], completed: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nothing to do here.")).toBeInTheDocument()
    await expect(canvas.queryByRole("region", { name: /Completed/ })).not.toBeInTheDocument()
  },
}
