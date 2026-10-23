import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { SplitTemplate } from "./split-template"

const meta = {
  title: "Templates/SplitTemplate",
  component: SplitTemplate,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    children: <div className="h-60 rounded-lg border border-dashed">Content</div>,
    aside: <div className="h-60 rounded-lg border border-dashed">Illustration</div>,
  },
} satisfies Meta<typeof SplitTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Taskmaster" })).toHaveAttribute("href", "/")
    await expect(canvas.getByRole("main")).toHaveTextContent("Content")
    await expect(canvas.getByRole("main")).toHaveTextContent("Illustration")
  },
}
