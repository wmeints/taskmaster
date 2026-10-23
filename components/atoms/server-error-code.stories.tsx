import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ServerErrorCode } from "./server-error-code"

const meta = {
  title: "Atoms/ServerErrorCode",
  component: ServerErrorCode,
} satisfies Meta<typeof ServerErrorCode>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The failed and empty checkboxes stand in for the 0s; assistive tech hears the plain code.
    await expect(canvas.getByRole("img", { name: "500" })).toBeInTheDocument()
  },
}
