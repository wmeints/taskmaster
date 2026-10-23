import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, screen } from "storybook/test"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./popover"

const meta = {
  title: "Atoms/Popover",
  component: Popover,
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Deadline</PopoverTitle>
          <PopoverDescription>Pick a day.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open" }))

    await expect(await screen.findByText("Pick a day.")).toBeInTheDocument()
  },
}
