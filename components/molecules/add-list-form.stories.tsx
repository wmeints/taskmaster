import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { AddListForm } from "./add-list-form"

const meta = {
  title: "Molecules/AddListForm",
  component: AddListForm,
  args: {
    onAdd: fn(async () => undefined),
    onCancel: fn(),
  },
  decorators: [(Story) => <div className="w-56"><Story /></div>],
} satisfies Meta<typeof AddListForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "List name" })).toHaveFocus()
  },
}

export const AddsAList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "List name" }), "Reading{enter}")

    await expect(args.onAdd).toHaveBeenCalledWith({ name: "Reading" })
  },
}

export const RequiresAName: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "List name" }), "{enter}")

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Enter a list name")
    await expect(args.onAdd).not.toHaveBeenCalled()
  },
}

export const CancelsOnEscape: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "List name" }), "{escape}")

    await expect(args.onCancel).toHaveBeenCalled()
  },
}
