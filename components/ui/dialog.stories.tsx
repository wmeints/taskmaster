import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, screen, waitFor } from "storybook/test"

import { Button } from "./button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"

const meta = {
  title: "Atoms/Dialog",
  component: Dialog,
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Everything you can do without a mouse.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open" }))
    const dialog = await screen.findByRole("dialog", { name: "Keyboard shortcuts" })

    await userEvent.click(screen.getByRole("button", { name: "Close" }))

    await waitFor(() => expect(dialog).not.toBeInTheDocument())
  },
}
