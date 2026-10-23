import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { SiteHeader } from "./site-header"

const meta = {
  title: "Organisms/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" })

    await expect(nav.querySelectorAll("a")).toHaveLength(3)
    await expect(canvas.getByRole("link", { name: "Features" })).toHaveAttribute("href", "#features")
    await expect(canvas.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/auth/sign-in")
    await expect(canvas.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/auth/sign-up")
  },
}

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
}
