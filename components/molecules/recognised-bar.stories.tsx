import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { RecognisedBar } from "./recognised-bar"

const meta = {
  title: "Molecules/RecognisedBar",
  component: RecognisedBar,
  args: {
    deadline: "Tomorrow",
    list: { name: "Home renovation", color: "orange" },
  },
  decorators: [(Story) => <div className="w-[36rem] border">{Story()}</div>],
} satisfies Meta<typeof RecognisedBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Recognised")
    await expect(canvasElement).toHaveTextContent("Deadline: Tomorrow")
    await expect(canvasElement).toHaveTextContent("List: Home renovation")
    await expect(canvasElement).toHaveTextContent("Dates like “fri” · # for a list")
  },
}

// Nothing recognised yet: only the hint.
export const NothingRecognised: Story = {
  args: { deadline: null, list: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).not.toHaveTextContent("Recognised")
    await expect(canvasElement).toHaveTextContent("Dates like “fri” · # for a list")
  },
}

// Under a form field: no border and no hint.
export const Inline: Story = {
  args: { variant: "inline" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Deadline: Tomorrow")
    await expect(canvasElement).toHaveTextContent("List: Home renovation")
    await expect(canvasElement).not.toHaveTextContent("Dates like")
  },
}

// A list that doesn't exist yet and will be created with the task.
export const NewList: Story = {
  args: { variant: "inline", deadline: null, list: null, newList: "Summer holiday" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent("Recognised")
    await expect(canvasElement).toHaveTextContent("New list: Summer holiday")
  },
}
