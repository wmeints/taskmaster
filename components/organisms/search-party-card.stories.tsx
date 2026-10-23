import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { SearchPartyCard } from "./search-party-card"

const meta = {
  title: "Organisms/SearchPartyCard",
  component: SearchPartyCard,
  decorators: [
    (Story) => (
      <div className="max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchPartyCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // A picture of a list, not a list to tick off.
    await expect(canvas.getByRole("figure", { name: "A search party that found everything but this page" })).toBeInTheDocument()
    await expect(canvas.queryAllByRole("checkbox")).toHaveLength(0)
    await expect(canvas.getByText("Find the page you were looking for")).toBeInTheDocument()
    await expect(canvas.getByText("4 of 5 done")).toBeInTheDocument()
  },
}
