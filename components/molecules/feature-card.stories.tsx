import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Inbox } from "lucide-react"
import { expect } from "storybook/test"

import { FeatureCard } from "./feature-card"

const meta = {
  title: "Molecules/FeatureCard",
  component: FeatureCard,
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: Inbox,
    title: "Inbox for quick capture",
    description: "Drop a task in the moment you think of it. Sort out deadlines and lists later.",
  },
} satisfies Meta<typeof FeatureCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: args.title })).toBeInTheDocument()
    await expect(canvas.getByText(args.description)).toBeInTheDocument()
  },
}
