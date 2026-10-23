import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, fn } from "storybook/test"

import { newTaskSchema, subtaskSchema } from "@/lib/tasks/schemas"

import { InlineAddForm } from "./inline-add-form"

const meta = {
  title: "Molecules/InlineAddForm",
  component: InlineAddForm,
  args: {
    label: "New task",
    placeholder: "Add a task to Today…",
    schema: newTaskSchema,
    onAdd: fn<React.ComponentProps<typeof InlineAddForm>["onAdd"]>(async () => undefined),
  },
  decorators: [(Story) => <div className="w-2xl"><Story /></div>],
} satisfies Meta<typeof InlineAddForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "New task" })).toHaveAttribute("placeholder", "Add a task to Today…")
    await expect(canvas.getByText("add")).toBeInTheDocument()
  },
}

export const AddsAndClears: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "New task" })

    await userEvent.type(input, "  Buy paint {enter}")

    await expect(args.onAdd).toHaveBeenCalledWith({ title: "Buy paint" })
    await expect(input).toHaveValue("")
    await expect(input).toHaveFocus()
  },
}

export const ShowsValidationError: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "New task" }), "{enter}")

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Enter a task")
    await expect(args.onAdd).not.toHaveBeenCalled()
  },
}

export const ShowsServerError: Story = {
  args: {
    onAdd: fn<React.ComponentProps<typeof InlineAddForm>["onAdd"]>(async () => ({ error: "Something went wrong" })),
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "New task" })
    await userEvent.type(input, "Buy paint{enter}")

    await expect(await canvas.findByRole("alert")).toHaveTextContent("Something went wrong")
    await expect(input).toHaveValue("Buy paint")
  },
}

export const EscapeClears: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "New task" })
    await userEvent.type(input, "Half a thought{escape}")

    await expect(input).toHaveValue("")
    await expect(input).not.toHaveFocus()
  },
}

export const Subtask: Story = {
  args: {
    label: "New subtask",
    placeholder: "Add a subtask, press Enter",
    schema: subtaskSchema,
    variant: "dashed",
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("add")).not.toBeInTheDocument()
  },
}

// A deadline and list read from the title show under the field as the user types.
export const ShowsRecognised: Story = {
  args: {
    recognise: (title: string) => ({
      deadline: title.includes("^tomorrow") ? "Tomorrow" : null,
      list: title.includes("#home") ? { name: "Home renovation", color: "orange" as const } : null,
    }),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "New task" })
    await expect(canvasElement).not.toHaveTextContent("Recognised")

    await userEvent.type(input, "Paint ^tomorrow")
    await expect(canvasElement).toHaveTextContent("Deadline: Tomorrow")
    await expect(canvasElement).not.toHaveTextContent("List:")

    await userEvent.type(input, " #home{enter}")
    await expect(input).toHaveValue("")
    await expect(canvasElement).not.toHaveTextContent("Recognised")
  },
}
