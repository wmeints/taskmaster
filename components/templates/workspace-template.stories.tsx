import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { InlineAddForm } from "@/components/molecules/inline-add-form"
import { ViewHeader } from "@/components/molecules/view-header"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import { ShortcutBar } from "@/components/organisms/shortcut-bar"
import { TaskDetail } from "@/components/organisms/task-detail"
import { TaskList } from "@/components/organisms/task-list"
import { workspace } from "@/components/organisms/workspace.fixtures"
import { newTaskSchema } from "@/lib/tasks/schemas"

import { WorkspaceTemplate } from "./workspace-template"

const noop = async () => undefined

const meta = {
  title: "Templates/WorkspaceTemplate",
  component: WorkspaceTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    sidebar: <div>Sidebar</div>,
    footer: <div>Footer</div>,
    children: <div>Main</div>,
    detail: <div>Detail</div>,
  },
} satisfies Meta<typeof WorkspaceTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("main")).toHaveTextContent("Main")
    await expect(canvas.getByRole("complementary", { name: "Task details" })).toHaveTextContent("Detail")
    await expect(canvas.getByText("Sidebar")).toBeInTheDocument()
    await expect(canvas.getByText("Footer")).toBeInTheDocument()
  },
}

export const WithoutDetail: Story = {
  args: { detail: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("complementary", { name: "Task details" })).not.toBeInTheDocument()
  },
}

// The Today view from the design, with the first task open.
export const Filled: Story = {
  parameters: { nextjs: { appDirectory: true } },
  args: {
    sidebar: (
      <AppSidebar
        counts={workspace.counts}
        lists={workspace.lists}
        scope={workspace.scope}
        account={{ name: "You", email: "you@example.com", createdAt: new Date("2026-10-01T09:30:00Z") }}
        signOutAction={async () => {}}
        onSearch={() => {}}
        onShowShortcuts={() => {}}
        onCreateList={async () => ({ id: "new" })}
      />
    ),
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
