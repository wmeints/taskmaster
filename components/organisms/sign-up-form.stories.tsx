import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { SignUpForm } from "./sign-up-form"

const meta = {
  title: "Organisms/SignUpForm",
  component: SignUpForm,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    action: fn<React.ComponentProps<typeof SignUpForm>["action"]>(async () => undefined),
  },
} satisfies Meta<typeof SignUpForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Create an account" })).toBeInTheDocument()
    await expect(canvas.getByLabelText("Password")).toHaveAttribute("type", "password")
    await expect(canvas.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/auth/sign-in")
  },
}

export const PrefilledEmail: Story = {
  args: { defaultEmail: "ada@example.com" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveValue("ada@example.com")
  },
}

export const ShowsValidationErrors: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Password"), "short")
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }))

    await expect(await canvas.findByText("Enter your name")).toBeInTheDocument()
    await expect(canvas.getByText("Enter a valid email address")).toBeInTheDocument()
    await expect(canvas.getByText("Use at least 8 characters")).toBeInTheDocument()
    await expect(args.action).not.toHaveBeenCalled()
  },
}

export const SubmitsValidValues: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada")
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@example.com")
    await userEvent.type(canvas.getByLabelText("Password"), "correct horse")
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }))

    await expect(args.action).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      password: "correct horse",
    })
  },
}

export const ShowsServerError: Story = {
  args: {
    action: fn<React.ComponentProps<typeof SignUpForm>["action"]>(async () => ({ error: "Email already in use" })),
    defaultEmail: "ada@example.com",
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada")
    await userEvent.type(canvas.getByLabelText("Password"), "correct horse")
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }))

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Email already in use")
  },
}
