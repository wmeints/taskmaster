import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { SearchTrigger } from "./search-trigger"

const meta = {
  title: "Molecules/SearchTrigger",
  component: SearchTrigger,
  args: { onClick: fn() },
  decorators: [(Story) => <div className="w-56"><Story /></div>],
} satisfies Meta<typeof SearchTrigger>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search or command…" }))

    await expect(args.onClick).toHaveBeenCalled()
    await expect(canvas.getByText("⌘K").tagName).toBe("KBD")
  },
}
