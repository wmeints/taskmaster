import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { MobileTabBar } from "./mobile-tab-bar"

const meta = {
  title: "Organisms/MobileTabBar",
  component: MobileTabBar,
  parameters: { nextjs: { appDirectory: true } },
  args: { active: "planner", onShowLists: fn(), onShowMore: fn() },
  decorators: [(Story) => <div className="w-[390px]"><Story /></div>],
} satisfies Meta<typeof MobileTabBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", "/inbox")
    await expect(canvas.getByRole("link", { name: "Planner" })).toHaveAttribute("href", "/today")
    await expect(canvas.getByRole("link", { name: "Planner" })).toHaveAttribute("aria-current", "page")
    await expect(canvas.getByRole("link", { name: "Inbox" })).not.toHaveAttribute("aria-current")
  },
}

export const InList: Story = {
  args: { active: "lists" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Lists" })).toHaveAttribute("data-active", "true")
    await expect(canvas.getByRole("link", { name: "Planner" })).not.toHaveAttribute("aria-current")
  },
}

export const OpensListsAndMore: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Lists" }))
    await userEvent.click(canvas.getByRole("button", { name: "More" }))

    await expect(args.onShowLists).toHaveBeenCalled()
    await expect(args.onShowMore).toHaveBeenCalled()
  },
}
