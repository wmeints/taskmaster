import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { NotFoundCode } from "./not-found-code"

const meta = {
  title: "Atoms/NotFoundCode",
  component: NotFoundCode,
} satisfies Meta<typeof NotFoundCode>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The empty checkbox stands in for the 0; assistive tech hears the plain code.
    await expect(canvas.getByRole("img", { name: "404" })).toBeInTheDocument()
  },
}
