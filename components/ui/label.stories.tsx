import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Atoms/Label",
  component: Label,
  args: {
    children: "Email address",
  },
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LabelsAnInput: Story = {
  args: { htmlFor: "email" },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Label {...args} />
      <Input id="email" />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Email address"))

    await expect(canvas.getByRole("textbox", { name: "Email address" })).toHaveFocus()
  },
}
