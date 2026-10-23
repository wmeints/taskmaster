import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { LandingTemplate } from "./landing-template"

const meta = {
  title: "Templates/LandingTemplate",
  component: LandingTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <div className="flex h-96 items-center justify-center border-2 border-dashed text-muted-foreground">
        Page content
      </div>
    ),
  },
} satisfies Meta<typeof LandingTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("banner")).toBeInTheDocument()
    await expect(canvas.getByRole("main")).toHaveTextContent("Page content")
    await expect(canvas.getByRole("contentinfo")).toBeInTheDocument()
  },
}
