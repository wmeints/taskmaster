import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen, waitFor } from "storybook/test"

import { ListActionsMenu } from "./list-actions-menu"

const meta = {
  title: "Molecules/ListActionsMenu",
  component: ListActionsMenu,
  args: {
    listName: "Reading",
    onShare: fn(),
    onDelete: fn(async (): Promise<{ error: string } | void> => undefined),
  },
} satisfies Meta<typeof ListActionsMenu>

export default meta

type Story = StoryObj<typeof meta>

async function chooseDelete(canvas: { getByRole: typeof screen.getByRole }, userEvent: { click: (el: Element) => Promise<void> }) {
  await userEvent.click(canvas.getByRole("button", { name: "Actions for Reading" }))
  await userEvent.click(await screen.findByRole("menuitem", { name: "Delete list…" }))
  return screen.findByRole("alertdialog", { name: "Delete “Reading”?" })
}

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Actions for Reading" })).toBeInTheDocument()
  },
}

export const Shares: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Reading" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Share list…" }))

    await expect(args.onShare).toHaveBeenCalledOnce()
  },
}

// Someone the list was shared with can leave it, but not share or delete it.
export const SharedWithMe: Story = {
  args: { onShare: undefined, onDelete: undefined, onLeave: fn(async () => undefined) },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Reading" }))
    await expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual(["Leave list…"])
    await userEvent.click(screen.getByRole("menuitem", { name: "Leave list…" }))

    const dialog = await screen.findByRole("alertdialog", { name: "Leave “Reading”?" })
    await expect(dialog).toHaveTextContent("You'll need a new invite to see its tasks again.")
    await userEvent.click(screen.getByRole("button", { name: "Leave list" }))

    await expect(args.onLeave).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  },
}

// Deleting asks first and explains that the tasks stay.
export const AsksBeforeDeleting: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const dialog = await chooseDelete(canvas, userEvent)
    await expect(dialog).toHaveTextContent("Its tasks stay in your views, without a list.")
    await expect(args.onDelete).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const Deletes: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await chooseDelete(canvas, userEvent)

    await userEvent.click(screen.getByRole("button", { name: "Delete list" }))

    await expect(args.onDelete).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  },
}

export const ShowsErrors: Story = {
  args: { onDelete: fn(async () => ({ error: "Invalid request" })) },
  play: async ({ canvas, userEvent }) => {
    await chooseDelete(canvas, userEvent)

    await userEvent.click(screen.getByRole("button", { name: "Delete list" }))

    await expect(await screen.findByRole("alert")).toHaveTextContent("Invalid request")
    await expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  },
}
