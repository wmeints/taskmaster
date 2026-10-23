import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { CtaSection } from "./cta-section"

const meta = {
  title: "Organisms/CtaSection",
  component: CtaSection,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof CtaSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector("section")).toHaveAttribute("id", "get-started")
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Ready to start todoing?" })
    ).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Sign up" })).toBeInTheDocument()

    const logIn = canvas.getByRole("link", { name: "I already have an account – Log in" })
    await expect(logIn).toHaveAttribute("href", "/auth/sign-in")
    // The outline variant's border must survive class merging.
    await expect(logIn).toHaveClass("border-border")
    await expect(logIn).not.toHaveClass("border-transparent")
  },
}
