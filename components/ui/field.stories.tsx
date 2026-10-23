import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./field"
import { Input } from "./input"

const meta = {
  title: "Atoms/Field",
  component: Field,
} satisfies Meta<typeof Field>

export default meta

type Story = StoryObj<typeof meta>

export const WithDescription: Story = {
  render: () => (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" />
        <FieldDescription>Shown on shared lists.</FieldDescription>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Name" })).toBeInTheDocument()
    await expect(canvas.getByText("Shown on shared lists.")).toBeInTheDocument()
  },
}

export const Invalid: Story = {
  render: () => (
    <FieldGroup className="max-w-sm">
      <Field data-invalid>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-invalid />
        <FieldError errors={[{ message: "Enter a valid email address" }]} />
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a valid email address")
  },
}

export const DeduplicatesErrors: Story = {
  render: () => (
    <Field data-invalid className="max-w-sm">
      <FieldError errors={[{ message: "Too short" }, { message: "Too short" }, { message: "No digits" }]} />
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2)
  },
}
