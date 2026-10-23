import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, within } from "storybook/test"

import { CommandMenu } from "./command-menu"
import { lists, workspace } from "./workspace.fixtures"

const [, home] = lists
const typed = "Call the dentist tomorrow #home"

const meta = {
  title: "Organisms/CommandMenu",
  component: CommandMenu,
  args: {
    open: true,
    onOpenChange: fn(),
    lists,
    searchable: workspace.searchable,
    today: workspace.today,
    onNavigate: fn(),
    onShowShortcuts: fn(),
    onAddTask: fn(async (): Promise<{ id: string } | { error: string }> => ({ id: "new-task" })),
  },
} satisfies Meta<typeof CommandMenu>

export default meta

type Story = StoryObj<typeof meta>

async function input() {
  return screen.findByRole("combobox")
}

// Nothing typed: the views, lists and commands, with the keys to use them.
export const Default: Story = {
  play: async () => {
    await expect(await screen.findByRole("option", { name: "Today 2" })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: "Website relaunch" })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: "Keyboard shortcuts ?" })).toBeInTheDocument()
    const dialog = screen.getByRole("dialog", { name: "Search or command" })
    await expect(dialog).toHaveTextContent(/navigate.*select.*commands only.*back to app/)
  },
}

// The design: the deadline and list are read from the text, and matching tasks show below.
export const QuickAdd: Story = {
  play: async ({ userEvent }) => {
    await userEvent.type(await input(), typed)

    const dialog = screen.getByRole("dialog", { name: "Search or command" })
    await expect(dialog).toHaveTextContent("Deadline: Tomorrow")
    await expect(dialog).toHaveTextContent("List: Home renovation")
    await expect(screen.getByRole("option", { name: /^Add “Call the dentist” · Tomorrow · Home renovation/ })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    await expect(screen.getByRole("option", { name: /^Add and open details/ })).toBeInTheDocument()
    await expect(screen.getByRole("option", { name: /^Drop full text in Inbox/ })).toBeInTheDocument()

    const matches = within(screen.getByRole("group", { name: "Matching tasks" }))
    await expect(matches.getByRole("option", { name: "Find a dentist near the new place · Inbox" })).toBeInTheDocument()
    await expect(matches.getByRole("option", { name: "Book dentist check-up · Completed" })).toBeInTheDocument()
    await expect(matches.getAllByText("dentist")[0].tagName).toBe("MARK")
  },
}

export const AddsWithEnter: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), `${typed}{enter}`)

    await expect(args.onAddTask).toHaveBeenCalledWith({
      title: "Call the dentist",
      due: { date: "2026-10-22", time: null },
      listId: home.id,
    })
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
    await expect(args.onNavigate).not.toHaveBeenCalled()
  },
}

export const AddsAndOpensWithModEnter: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), typed)
    await userEvent.keyboard("{Control>}{Enter}{/Control}")

    await expect(args.onAddTask).toHaveBeenCalledWith(expect.objectContaining({ title: "Call the dentist" }))
    await expect(args.onNavigate).toHaveBeenCalledWith(`/lists/${home.id}?task=new-task`)
  },
}

export const DropsInInboxWithShiftEnter: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), typed)
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}")

    await expect(args.onAddTask).toHaveBeenCalledWith({ title: typed, due: null, listId: null })
  },
}

export const ShowsAddErrors: Story = {
  args: { onAddTask: fn(async () => ({ error: "Keep it under 500 characters" })) },
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), "Buy paint{enter}")

    await expect(await screen.findByRole("alert")).toHaveTextContent("Keep it under 500 characters")
    await expect(args.onOpenChange).not.toHaveBeenCalled()
  },
}

export const OpensAMatchingTask: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), "paint")
    await userEvent.click(screen.getByRole("option", { name: /Order paint samples/ }))

    await expect(args.onNavigate).toHaveBeenCalledWith("/tomorrow?task=0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697806")
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
  },
}

export const GoesToAMatchingList: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), "reading")
    await userEvent.click(screen.getByRole("option", { name: "Reading" }))

    await expect(args.onNavigate).toHaveBeenCalledWith(`/lists/${lists[2].id}`)
  },
}

// ">" leaves out creating and tasks.
export const CommandsOnly: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.type(await input(), ">short{enter}")

    await expect(screen.queryByRole("option", { name: /^Add/ })).not.toBeInTheDocument()
    await expect(args.onShowShortcuts).toHaveBeenCalled()
    await expect(args.onAddTask).not.toHaveBeenCalled()
  },
}
