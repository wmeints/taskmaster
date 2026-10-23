import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { MobileTopBar } from "./mobile-top-bar"

const meta = {
  title: "Molecules/MobileTopBar",
  component: MobileTopBar,
  args: { onOpenMenu: fn(), onSearch: fn() },
  decorators: [(Story) => <div className="w-[390px]"><Story /></div>],
} satisfies Meta<typeof MobileTopBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }))
    await userEvent.click(canvas.getByRole("button", { name: "Search" }))

    await expect(args.onOpenMenu).toHaveBeenCalled()
    await expect(args.onSearch).toHaveBeenCalled()
  },
}
