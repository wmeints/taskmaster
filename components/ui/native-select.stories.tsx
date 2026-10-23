import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { NativeSelect, NativeSelectOption } from "./native-select"

const meta = {
  title: "Atoms/NativeSelect",
  component: NativeSelect,
  args: { "aria-label": "List" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOption value="">No list</NativeSelectOption>
      <NativeSelectOption value="website">Website relaunch</NativeSelectOption>
    </NativeSelect>
  ),
} satisfies Meta<typeof NativeSelect>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "List" })
    await userEvent.selectOptions(select, "website")

    await expect(select).toHaveValue("website")
  },
}
