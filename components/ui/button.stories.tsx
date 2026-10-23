import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { Button } from "./button"

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: { variant: "outline" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled()
  },
}

export const Clickable: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Button" }))

    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
