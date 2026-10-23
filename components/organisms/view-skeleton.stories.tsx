import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { ViewSkeleton } from "./view-skeleton"

const meta = {
  title: "Organisms/ViewSkeleton",
  component: ViewSkeleton,
  args: { heading: { title: "Tomorrow", subtitle: "Thursday 22 October" } },
  decorators: [(Story) => <div className="flex w-[42rem] flex-col gap-6"><Story /></div>],
} satisfies Meta<typeof ViewSkeleton>

export default meta

type Story = StoryObj<typeof meta>

// Switching to a view: its title is known straight away, its tasks are still loading.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
    await expect(canvas.getByText("Thursday 22 October")).toBeInTheDocument()
    await expect(canvas.getByPlaceholderText("Add a task to Tomorrow…")).toBeInTheDocument()
  },
}

// The first load, before anything about the view is known.
export const WithoutHeading: Story = {
  args: { heading: null },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("heading", { level: 1 })).not.toBeInTheDocument()
  },
}

// On small screens the planner's pills stay in place while the next view loads.
export const WithTabs: Story = {
  args: { tabs: <nav aria-label="Planner">Today · Tomorrow</nav> },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Planner" })).toBeInTheDocument()
  },
}
