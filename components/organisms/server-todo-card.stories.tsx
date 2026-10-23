import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ServerTodoCard } from "./server-todo-card"

const meta = {
  title: "Organisms/ServerTodoCard",
  component: ServerTodoCard,
  decorators: [
    (Story) => (
      <div className="max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ServerTodoCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // A picture of a list, not a list to tick off.
    await expect(canvas.getByRole("figure", { name: "The server’s todo list, with your problem on it" })).toBeInTheDocument()
    await expect(canvas.queryAllByRole("checkbox")).toHaveLength(0)
    await expect(canvas.getByText("Fix whatever you just ran into")).toBeInTheDocument()
    await expect(canvas.getByText("2 of 4 done")).toBeInTheDocument()
  },
}
