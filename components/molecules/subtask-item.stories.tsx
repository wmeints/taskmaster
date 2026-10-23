import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { SubtaskItem } from "./subtask-item"

const meta = {
  title: "Molecules/SubtaskItem",
  component: SubtaskItem,
  args: {
    subtask: { id: "s1", title: "Check payment error states", done: false },
    onToggle: fn(),
    onDelete: fn(),
  },
  decorators: [(Story) => <ul className="w-80"><Story /></ul>],
} satisfies Meta<typeof SubtaskItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Check payment error states" }))
    await expect(args.onToggle).toHaveBeenCalledWith(true)

    await userEvent.click(canvas.getByRole("button", { name: "Delete subtask Check payment error states" }))
    await expect(args.onDelete).toHaveBeenCalled()
  },
}

export const Done: Story = {
  args: { subtask: { id: "s1", title: "Run the branch locally", done: true } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox")).toBeChecked()
    await expect(canvas.getByText("Run the branch locally")).toHaveClass("line-through")
  },
}

export const Saving: Story = {
  args: { saving: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox", { name: "Check payment error states" })).toHaveAttribute("aria-disabled", "true")
    await expect(canvas.getByRole("button", { name: "Delete subtask Check payment error states" })).toBeDisabled()
  },
}
