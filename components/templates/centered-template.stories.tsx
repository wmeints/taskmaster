import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { CenteredTemplate } from "./centered-template"

const meta = {
  title: "Templates/CenteredTemplate",
  component: CenteredTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    children: <div className="h-40 w-full max-w-sm rounded-lg border border-dashed">Content</div>,
  },
} satisfies Meta<typeof CenteredTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const main = canvas.getByRole("main")

    await expect(main).toHaveTextContent("Content")
  },
}
