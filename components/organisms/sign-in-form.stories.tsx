import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { SignInForm } from "./sign-in-form"

const meta = {
  title: "Organisms/SignInForm",
  component: SignInForm,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    action: fn<React.ComponentProps<typeof SignInForm>["action"]>(async () => undefined),
  },
} satisfies Meta<typeof SignInForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
    await expect(canvas.getByLabelText("Password")).toHaveAttribute("type", "password")
    await expect(canvas.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/auth/sign-up")
  },
}

export const ShowsValidationErrors: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }))

    await expect(await canvas.findByText("Enter a valid email address")).toBeInTheDocument()
    await expect(canvas.getByText("Enter your password")).toBeInTheDocument()
    await expect(args.action).not.toHaveBeenCalled()
  },
}

export const SubmitsValidValues: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com")
    await userEvent.type(canvas.getByLabelText("Password"), "secret")
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }))

    await expect(args.action).toHaveBeenCalledWith({ email: "ada@example.com", password: "secret" })
  },
}

export const ShowsServerError: Story = {
  args: {
    action: fn<React.ComponentProps<typeof SignInForm>["action"]>(async () => ({ error: "Invalid email or password" })),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com")
    await userEvent.type(canvas.getByLabelText("Password"), "wrong")
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }))

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Invalid email or password")
  },
}
