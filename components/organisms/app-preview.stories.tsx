import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { AppPreview } from "./app-preview"

const meta = {
  title: "Organisms/AppPreview",
  component: AppPreview,
  decorators: [
    (Story) => (
      <div className="max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppPreview>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The mock UI is one image to assistive tech, not a set of fake controls.
    await expect(
      canvas.getByRole("figure", { name: "Preview of the Taskmaster Today view" })
    ).toBeInTheDocument()
    await expect(canvas.queryAllByRole("listitem")).toHaveLength(0)
  },
}
