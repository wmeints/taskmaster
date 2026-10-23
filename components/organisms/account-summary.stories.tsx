import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { AccountSummary } from "./account-summary"

const meta = {
  title: "Organisms/AccountSummary",
  component: AccountSummary,
  args: {
    account: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      createdAt: new Date("2026-10-01T09:30:00Z"),
    },
    signOutAction: fn(async () => {}),
  },
} satisfies Meta<typeof AccountSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Signed in as Ada Lovelace" })).toBeInTheDocument()
    await expect(canvas.getByTestId("email")).toHaveTextContent("ada@example.com")
    await expect(canvas.getByTestId("db-created-at")).toHaveTextContent("2026-10-01T09:30:00.000Z")
  },
}

export const UnknownCreationDate: Story = {
  args: {
    account: { name: "Ada Lovelace", email: "ada@example.com", createdAt: null },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("db-created-at")).toHaveTextContent("not found")
  },
}

export const SignsOut: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }))

    await expect(args.signOutAction).toHaveBeenCalled()
  },
}
