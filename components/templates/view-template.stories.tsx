import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { InlineAddForm } from "@/components/molecules/inline-add-form"
import { ViewHeader } from "@/components/molecules/view-header"
import { ShortcutBar } from "@/components/organisms/shortcut-bar"
import { TaskDetail } from "@/components/organisms/task-detail"
import { TaskList } from "@/components/organisms/task-list"
import { workspace } from "@/components/organisms/workspace.fixtures"
import { newTaskSchema } from "@/lib/tasks/schemas"

import { ViewTemplate } from "./view-template"

const noop = async () => undefined

const meta = {
  title: "Templates/ViewTemplate",
  component: ViewTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    footer: <div>Footer</div>,
    children: <div>Main</div>,
    detail: <div>Detail</div>,
  },
} satisfies Meta<typeof ViewTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("main")).toHaveTextContent("Main")
    await expect(canvas.getByRole("complementary", { name: "Task details" })).toHaveTextContent("Detail")
    await expect(canvas.getByText("Footer")).toBeInTheDocument()
  },
}

export const WithoutDetail: Story = {
  args: { detail: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("complementary", { name: "Task details" })).not.toBeInTheDocument()
  },
}

// No task open: wide screens keep the panel's space with a hint, so opening a task doesn't move the view.
export const EmptyDetail: Story = {
  args: { detail: undefined, emptyDetail: <div>Nothing open</div> },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("complementary", { name: "Task details" })).not.toBeInTheDocument()
    await expect(canvas.getByText("Nothing open")).toBeInTheDocument()
  },
}

export const Busy: Story = {
  args: { busy: true, detail: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument()
    await expect(canvas.getByRole("main")).toHaveAttribute("aria-busy", "true")
  },
}

// The Today view from the design, with the first task open.
export const Filled: Story = {
  args: {
    footer: <ShortcutBar />,
    detail: (
      <TaskDetail
        task={workspace.todo[0]}
        lists={workspace.lists}
        today={workspace.today}
        breadcrumb="Website relaunch / Today"
        onClose={() => {}}
        onChange={noop}
        onDelete={() => {}}
        onAddSubtask={noop}
        onToggleSubtask={() => {}}
        onDeleteSubtask={() => {}}
      />
    ),
    children: (
      <>
        <ViewHeader title="Today" subtitle="Wednesday 21 October" onNewTask={() => {}} />
        <InlineAddForm label="New task" placeholder="Add a task to Today…" schema={newTaskSchema} onAdd={noop} />
        <TaskList
          todo={workspace.todo}
          completed={workspace.completed}
          today={workspace.today}
          selectedId={workspace.todo[0].id}
          hideCompleted={false}
          onToggleHideCompleted={() => {}}
          onSelect={() => {}}
          onToggle={() => {}}
        />
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument()
    await expect(canvas.getByRole("complementary", { name: "Task details" })).toBeInTheDocument()
  },
}
