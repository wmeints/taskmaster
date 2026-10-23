import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SunIcon } from "lucide-react"
import { expect } from "storybook/test"

import { ListDot } from "@/components/atoms/list-dot"

import { SidebarNavItem } from "./sidebar-nav-item"

const meta = {
  title: "Molecules/SidebarNavItem",
  component: SidebarNavItem,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    href: "/today",
    label: "Today",
    count: 3,
    leading: <SunIcon />,
  },
  decorators: [(Story) => <ul className="w-56"><Story /></ul>],
} satisfies Meta<typeof SidebarNavItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /Today/ })
    await expect(link).toHaveAttribute("href", "/today")
    await expect(link).not.toHaveAttribute("aria-current")
    await expect(link).toHaveTextContent("3")
  },
}

export const Active: Story = {
  args: { active: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Today/ })).toHaveAttribute("aria-current", "page")
  },
}

export const List: Story = {
  args: { href: "/lists/1", label: "Website relaunch", count: 4, leading: <ListDot color="blue" /> },
}

export const WithoutOpenTasks: Story = {
  args: { count: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Today" })).not.toHaveTextContent("0")
  },
}
