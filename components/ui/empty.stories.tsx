import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { InboxIcon } from "lucide-react"
import { expect } from "storybook/test"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty"

const meta = {
  title: "Atoms/Empty",
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing here</EmptyTitle>
        <EmptyDescription>Add a task to get started.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nothing here")).toBeInTheDocument()
    await expect(canvas.getByText("Add a task to get started.")).toBeInTheDocument()
  },
}
