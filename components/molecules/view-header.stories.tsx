import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { ViewHeader } from "./view-header"

const meta = {
  title: "Molecules/ViewHeader",
  component: ViewHeader,
  args: { title: "Today", subtitle: "Wednesday 21 October", onNewTask: fn() },
  decorators: [(Story) => <div className="w-2xl"><Story /></div>],
} satisfies Meta<typeof ViewHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument()
    await expect(canvas.getByText("Wednesday 21 October")).toBeInTheDocument()

    await userEvent.click(canvas.getByRole("button", { name: "New task" }))

    await expect(args.onNewTask).toHaveBeenCalled()
  },
}

export const WithoutSubtitle: Story = {
  args: { subtitle: undefined, title: "Inbox" },
}
