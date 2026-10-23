import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"

const onSelectInbox = fn()

const meta = {
  title: "Atoms/Command",
  component: Command,
  args: { label: "Search", className: "w-80 border" },
  render: (args) => (
    <Command {...args}>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Views">
          <CommandItem onSelect={onSelectInbox}>Inbox</CommandItem>
          <CommandItem>Today</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
} satisfies Meta<typeof Command>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Search" }), "tod")

    await expect(canvas.getByRole("option", { name: "Today" })).toBeInTheDocument()
    await expect(canvas.queryByRole("option", { name: "Inbox" })).not.toBeInTheDocument()
  },
}

export const NothingFound: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Search" }), "zzz")

    await expect(canvas.getByText("Nothing found.")).toBeInTheDocument()
  },
}

export const SelectsWithEnter: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox", { name: "Search" }), "inb{enter}")

    await expect(onSelectInbox).toHaveBeenCalled()
  },
}
