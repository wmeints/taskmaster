import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { expect, fn } from "storybook/test"
import { z } from "zod"

import { FormTextField } from "./form-text-field"

const schema = z.object({
  email: z.email({ error: "Enter a valid email address" }),
})

// FormTextField needs a form's control, so render it inside a minimal form.
function ExampleForm({ onSubmit }: { onSubmit: (values: z.infer<typeof schema>) => void }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } })

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FormTextField control={form.control} name="email" label="Email" type="email" />
      <button type="submit">Submit</button>
    </form>
  )
}

const meta = {
  title: "Molecules/FormTextField",
  component: ExampleForm,
  args: { onSubmit: fn() },
} satisfies Meta<typeof ExampleForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" })

    await expect(input).toHaveAttribute("type", "email")
    await expect(input).toHaveAttribute("aria-invalid", "false")
  },
}

export const ShowsValidationError: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email" })

    await userEvent.type(input, "not-an-email")
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }))

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Enter a valid email address")
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

export const SubmitsValidValue: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com")
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }))

    await expect(args.onSubmit).toHaveBeenCalledWith({ email: "ada@example.com" }, expect.anything())
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument()
  },
}
