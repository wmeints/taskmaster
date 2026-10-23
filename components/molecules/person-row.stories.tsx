import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { PersonRow } from "./person-row"

const meta = {
  title: "Molecules/PersonRow",
  component: PersonRow,
  args: {
    name: "Mara Kok",
    detail: "mara@example.com",
    children: (
      <Button variant="outline" className="text-destructive">
        Remove
      </Button>
    ),
  },
  decorators: [(Story) => <ul className="w-[26rem]"><Story /></ul>],
} satisfies Meta<typeof PersonRow>

export default meta

type Story = StoryObj<typeof meta>

// Members show their initials.
export const Member: Story = {
  play: async ({ canvas }) => {
    const row = canvas.getByRole("listitem")
    await expect(row).toHaveTextContent("MKMara Kokmara@example.com")
    await expect(canvas.getByRole("button", { name: "Remove" })).toBeInTheDocument()
  },
}

export const Owner: Story = {
  args: {
    name: "You",
    detail: "ada@example.com",
    avatar: "self",
    initials: "A",
    children: <Badge variant="outline">Owner</Badge>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("AYouada@example.comOwner")
  },
}

// Someone invited by email who hasn't replied yet gets an envelope instead of initials.
export const Invite: Story = {
  args: {
    name: "joost@example.com",
    detail: "Invite sent · waiting for reply",
    avatar: "invite",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("joost@example.comInvite sent · waiting for reply")
    await expect(canvas.queryByText("J")).not.toBeInTheDocument()
  },
}
