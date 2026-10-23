import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { ListNav } from "./list-nav"
import { lists } from "./workspace.fixtures"

const meta = {
  title: "Organisms/ListNav",
  component: ListNav,
  parameters: { nextjs: { appDirectory: true } },
  args: {
    lists,
    scope: { listId: lists[0].id },
    onCreateList: fn(async () => ({ id: "new-list" })),
    onDeleteList: fn(async () => undefined),
  },
  decorators: [(Story) => <div className="w-60"><Story /></div>],
} satisfies Meta<typeof ListNav>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Lists" })
    await expect(nav).toHaveTextContent(/Website relaunch.*Home renovation.*Reading/)
    await expect(canvas.getByRole("link", { name: /Website relaunch/ })).toHaveAttribute("aria-current", "page")
  },
}

export const CreatesAList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New list" }))
    await userEvent.type(canvas.getByRole("textbox", { name: "List name" }), "Groceries{enter}")

    await expect(args.onCreateList).toHaveBeenCalledWith({ name: "Groceries" })
    await expect(canvas.queryByRole("textbox", { name: "List name" })).not.toBeInTheDocument()
  },
}

export const DeletesList: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: `Actions for ${lists[2].name}` }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Delete list" }))

    await expect(args.onDeleteList).toHaveBeenCalledWith(lists[2].id)
  },
}
