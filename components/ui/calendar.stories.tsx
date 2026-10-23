import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { Calendar } from "./calendar"

const onSelect = fn()

const meta = {
  title: "Atoms/Calendar",
  component: Calendar,
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 9, 1)}
      selected={new Date(2026, 9, 21)}
      onSelect={onSelect}
    />
  ),
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText("October 2026")).toBeInTheDocument()

    await userEvent.click(canvas.getByRole("button", { name: /October 28/ }))

    await expect(onSelect).toHaveBeenCalled()
  },
}
