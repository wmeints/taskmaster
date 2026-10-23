import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { Checkbox } from "./checkbox"

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Done", onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Done" })
    await expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    await expect(checkbox).toBeChecked()
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
  },
}

export const Checked: Story = {
  args: { defaultChecked: true },
}
