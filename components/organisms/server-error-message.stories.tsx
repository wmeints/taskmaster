import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn, userEvent } from "storybook/test"

import { ServerErrorMessage } from "./server-error-message"

const meta = {
  title: "Organisms/ServerErrorMessage",
  component: ServerErrorMessage,
  parameters: { nextjs: { appDirectory: true } },
  args: { onRetry: fn(), digest: "2943841913" },
  decorators: [
    (Story) => (
      <div className="max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ServerErrorMessage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Well, we dropped the ball." })).toBeInTheDocument()
    await expect(canvas.getByText("Error 500 · Something broke")).toBeInTheDocument()
    await expect(canvas.getByRole("link", { name: "Go to Today" })).toHaveAttribute("href", "/today")
    await expect(canvas.getByText("2943841913")).toBeInTheDocument()
  },
}

export const WithoutDigest: Story = {
  args: { digest: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/mention reference/)).not.toBeInTheDocument()
  },
}

export const TryAgain: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }))

    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}

export const RTriesAgain: Story = {
  play: async ({ args }) => {
    ;(document.activeElement as HTMLElement | null)?.blur()

    await userEvent.keyboard("r")

    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}
