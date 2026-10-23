import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { SiteFooter } from "./site-footer"

const meta = {
  title: "Organisms/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SiteFooter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("contentinfo")).toBeInTheDocument()
    await expect(canvas.getByRole("link", { name: "Taskmaster" })).toHaveAttribute("href", "/")

    const legal = canvas.getByRole("navigation", { name: "Legal" })
    await expect(legal).toHaveTextContent("Privacy")
    await expect(legal).toHaveTextContent("Terms")
  },
}
