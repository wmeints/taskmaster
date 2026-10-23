import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { getRouter } from "@storybook/nextjs-vite/navigation.mock"
import { expect, userEvent } from "storybook/test"

import { NotFoundMessage } from "./not-found-message"

const meta = {
  title: "Organisms/NotFoundMessage",
  component: NotFoundMessage,
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotFoundMessage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "This task doesn’t exist." })).toBeInTheDocument()
    await expect(canvas.getByText("Error 404 · Page not found")).toBeInTheDocument()
    await expect(canvas.getByRole("link", { name: "Back to Today" })).toHaveAttribute("href", "/today")
    await expect(canvas.getByRole("link", { name: "Search tasks" })).toHaveAttribute("href", "/today?search")
  },
}

export const EnterGoesBackToToday: Story = {
  play: async () => {
    getRouter().push.mockClear()
    ;(document.activeElement as HTMLElement | null)?.blur()

    await userEvent.keyboard("{Enter}")

    await expect(getRouter().push).toHaveBeenCalledWith("/today")
  },
}

export const ModKSearchesTasks: Story = {
  play: async () => {
    getRouter().push.mockClear()

    await userEvent.keyboard("{Meta>}k{/Meta}")

    await expect(getRouter().push).toHaveBeenCalledWith("/today?search")
  },
}

export const EnterOnAFocusedLinkFollowsThatLink: Story = {
  play: async ({ canvas }) => {
    getRouter().push.mockClear()
    canvas.getByRole("link", { name: "Search tasks" }).focus()

    await userEvent.keyboard("{Enter}")

    await expect(getRouter().push).not.toHaveBeenCalledWith("/today")
  },
}
