import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { EmailSignUpForm } from "./email-sign-up-form"

const meta = {
  title: "Molecules/EmailSignUpForm",
  component: EmailSignUpForm,
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    id: "email",
    submitLabel: "Sign up",
  },
} satisfies Meta<typeof EmailSignUpForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email address" })

    await expect(input).toHaveAttribute("name", "email")
    await expect(input).toHaveAttribute("type", "email")
    await expect(input).toBeRequired()
    await expect(input.closest("form")).toHaveAttribute("action", "/auth/sign-up")
  },
}

export const WithArrow: Story = {
  args: { submitLabel: "Create account", showArrow: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Create account" })

    await expect(button).toHaveAttribute("type", "submit")
    await expect(button.querySelector("svg")).toBeInTheDocument()
  },
}

export const RejectsInvalidEmail: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Email address" })

    await userEvent.type(input, "not-an-email")
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }))

    await expect(input).toBeInvalid()
  },
}
