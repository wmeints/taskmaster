import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { CommandMenu } from "./command-menu"
import { lists, workspace } from "./workspace.fixtures"

const meta = {
  title: "Organisms/CommandMenu",
  component: CommandMenu,
  args: {
    open: true,
    onOpenChange: fn(),
    lists,
    searchable: workspace.searchable,
    onNavigate: fn(),
    onNewTask: fn(),
    onShowShortcuts: fn(),
  },
} satisfies Meta<typeof CommandMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    // Views show their number key; tasks show the view they're in.
    await expect(await screen.findByRole("option", { name: "Today 2" })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: "Website relaunch" })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: "New task N" })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: "Order paint samples Tomorrow" })).toBeInTheDocument()
  },
}

export const FindsATaskInAnotherView: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await screen.findByRole("combobox"), "paint")
    await userEvent.click(screen.getByRole("option", { name: /Order paint samples/ }))

    await expect(args.onNavigate).toHaveBeenCalledWith("/tomorrow?task=0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697806")
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
  },
}

export const GoesToAList: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await screen.findByRole("combobox"), "reading{enter}")

    await expect(args.onNavigate).toHaveBeenCalledWith(`/lists/${lists[2].id}`)
  },
}

export const RunsACommand: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await screen.findByRole("combobox"), "new task{enter}")

    await expect(args.onNewTask).toHaveBeenCalled()
  },
}
