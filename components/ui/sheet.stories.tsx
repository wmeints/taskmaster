import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, screen, waitFor } from "storybook/test"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet"

const meta = {
  title: "Atoms/Sheet",
  component: Sheet,
  args: { defaultOpen: true },
} satisfies Meta<typeof Sheet>

export default meta

type Story = StoryObj<typeof meta>

export const Bottom: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Lists</SheetTitle>
          <SheetDescription>Slides up from the bottom of the screen.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ userEvent }) => {
    await expect(await screen.findByRole("dialog", { name: "Lists" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  },
}

export const Left: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async () => {
    await expect(await screen.findByRole("dialog", { name: "Menu" })).toHaveAttribute("data-side", "left")
  },
}
