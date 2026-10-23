import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { TaskDetailsForm } from "./task-details-form"

const meta = {
  title: "Molecules/TaskDetailsForm",
  component: TaskDetailsForm,
  args: {
    title: "Review pull request for checkout flow",
    description: "Focus on the payment error states and the empty-cart edge case.",
    onSave: fn(async () => undefined),
  },
  decorators: [(Story) => <div className="w-80"><Story /><button>Elsewhere</button></div>],
} satisfies Meta<typeof TaskDetailsForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Title" })).toHaveValue("Review pull request for checkout flow")
    await expect(canvas.getByRole("textbox", { name: /Description/ })).toHaveValue(
      "Focus on the payment error states and the empty-cart edge case."
    )
  },
}

export const SavesOnBlur: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const title = canvas.getByRole("textbox", { name: "Title" })
    await userEvent.clear(title)
    await userEvent.type(title, "Review checkout PR")
    await userEvent.click(canvas.getByRole("button", { name: "Elsewhere" }))

    await expect(args.onSave).toHaveBeenCalledWith({
      title: "Review checkout PR",
      description: "Focus on the payment error states and the empty-cart edge case.",
    })
  },
}

export const SavesTitleOnEnter: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), "!{enter}")

    await expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({ title: "Review pull request for checkout flow!" }))
  },
}

export const DoesNotSaveUnchanged: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("textbox", { name: "Title" }))
    await userEvent.click(canvas.getByRole("button", { name: "Elsewhere" }))

    await expect(args.onSave).not.toHaveBeenCalled()
  },
}

export const RequiresATitle: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.clear(canvas.getByRole("textbox", { name: "Title" }))
    await userEvent.click(canvas.getByRole("button", { name: "Elsewhere" }))

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Enter a title")
    await expect(args.onSave).not.toHaveBeenCalled()
  },
}
