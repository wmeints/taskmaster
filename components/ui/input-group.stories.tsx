import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SearchIcon } from "lucide-react"
import { expect } from "storybook/test"

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group"

const meta = {
  title: "Atoms/InputGroup",
  component: InputGroup,
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search…" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    // Clicking an addon focuses the input.
    await userEvent.click(canvas.getByText("⌘K"))

    await expect(canvas.getByRole("textbox", { name: "Search" })).toHaveFocus()
  },
}
