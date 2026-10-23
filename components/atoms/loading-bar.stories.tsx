import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { LoadingBar } from "./loading-bar"

const meta = {
  title: "Atoms/LoadingBar",
  component: LoadingBar,
  decorators: [(Story) => <div className="w-96"><Story /></div>],
} satisfies Meta<typeof LoadingBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Loading" })
    // Indeterminate: no value to announce.
    await expect(bar).not.toHaveAttribute("aria-valuenow")
  },
}
