import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { workspace } from "@/components/organisms/workspace.fixtures"

import { PlannerTabs } from "./planner-tabs"

const meta = {
  title: "Molecules/PlannerTabs",
  component: PlannerTabs,
  parameters: { nextjs: { appDirectory: true } },
  args: { counts: workspace.counts, active: "today" },
  decorators: [(Story) => <div className="w-[390px]"><Story /></div>],
} satisfies Meta<typeof PlannerTabs>

export default meta

type Story = StoryObj<typeof meta>

// The deadline views, without the inbox, each with its number of open tasks.
export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Planner" })
    await expect(nav).toHaveTextContent(/Today · \d+.*Tomorrow · \d+.*End of week · \d+.*Later · \d+/)
    await expect(nav).not.toHaveTextContent("Inbox")
    await expect(canvas.getByRole("link", { name: /Today/ })).toHaveAttribute("aria-current", "page")
    await expect(canvas.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("href", "/tomorrow")
  },
}

export const Pending: Story = {
  args: { active: "tomorrow", pending: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-busy", "true")
  },
}

export const HandlesNavigation: Story = {
  args: { onNavigate: fn() },
  play: async ({ canvas }) => {
    // Storybook's next/link drops onNavigate, so only check the links stay plain links.
    await expect(canvas.getAllByRole("link")).toHaveLength(4)
  },
}
