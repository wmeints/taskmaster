import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Textarea } from "./textarea"

const meta = {
  title: "Atoms/Textarea",
  component: Textarea,
  args: { "aria-label": "Description", placeholder: "Add some details" },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Description" })
    await userEvent.type(textarea, "Line one{enter}Line two")

    await expect(textarea).toHaveValue("Line one\nLine two")
  },
}
