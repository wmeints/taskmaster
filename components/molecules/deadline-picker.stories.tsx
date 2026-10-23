import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { DeadlinePicker } from "./deadline-picker"

const meta = {
  title: "Molecules/DeadlinePicker",
  component: DeadlinePicker,
  args: {
    today: "2026-10-21",
    due: { date: "2026-10-21", time: "14:00" },
    onChange: fn(),
  },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof DeadlinePicker>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByRole("button", { name: "Tomorrow" })).toHaveAttribute("aria-pressed", "false")
    await expect(canvas.getByText("Due Today, 14:00")).toBeInTheDocument()
  },
}

export const PicksAPresetKeepingTheTime: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "End of week" }))

    await expect(args.onChange).toHaveBeenCalledWith({ date: "2026-10-25", time: "14:00" })
  },
}

export const ClearsTheDeadline: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "None" }))

    await expect(args.onChange).toHaveBeenCalledWith(null)
  },
}

export const WithoutDeadline: Story = {
  args: { due: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByText("No deadline")).toBeInTheDocument()
  },
}

export const PickedDate: Story = {
  args: { due: { date: "2026-11-12", time: null } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /Pick date/ })).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByText("Due Thu 12 Nov")).toBeInTheDocument()
  },
}

export const PicksADateFromTheCalendar: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Pick date/ }))
    await userEvent.click(await screen.findByRole("button", { name: /October 28/ }))

    await expect(args.onChange).toHaveBeenCalledWith({ date: "2026-10-28", time: "14:00" })
  },
}

export const SetsATime: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Pick date/ }))
    const time = await screen.findByLabelText("Time")
    await userEvent.clear(time)
    await userEvent.type(time, "0930")
    await userEvent.tab()

    await expect(args.onChange).toHaveBeenLastCalledWith({ date: "2026-10-21", time: "09:30" })
  },
}
