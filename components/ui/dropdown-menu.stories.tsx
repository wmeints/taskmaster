import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, screen } from "storybook/test"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const onRename = fn()

const meta = {
  title: "Atoms/DropdownMenu",
  component: DropdownMenu,
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>List</DropdownMenuLabel>
          <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Rename" }))

    await expect(onRename).toHaveBeenCalled()
  },
}
