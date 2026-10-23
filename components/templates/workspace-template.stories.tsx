import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { TaskDetailEmpty } from "@/components/molecules/task-detail-empty"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import { ShortcutBar } from "@/components/organisms/shortcut-bar"
import { ViewSkeleton } from "@/components/organisms/view-skeleton"
import { workspace } from "@/components/organisms/workspace.fixtures"

import { ViewTemplate } from "./view-template"
import { WorkspaceTemplate } from "./workspace-template"

const meta = {
  title: "Templates/WorkspaceTemplate",
  component: WorkspaceTemplate,
  parameters: { layout: "fullscreen" },
  args: {
    sidebar: <div>Sidebar</div>,
    children: <div>View</div>,
  },
} satisfies Meta<typeof WorkspaceTemplate>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sidebar")).toBeInTheDocument()
    await expect(canvas.getByText("View")).toBeInTheDocument()
  },
}

// Switching to Tomorrow: the sidebar marks it as loading while the view shows its heading over a skeleton.
export const LoadingView: Story = {
  parameters: { nextjs: { appDirectory: true } },
  args: {
    sidebar: (
      <AppSidebar
        counts={workspace.counts}
        lists={workspace.lists}
        scope={{ view: "tomorrow" }}
        pending
        account={{ name: "You", email: "you@example.com", createdAt: new Date("2026-10-01T09:30:00Z") }}
        signOutAction={async () => {}}
        onSearch={() => {}}
        onShowShortcuts={() => {}}
        onCreateList={async () => ({ id: "new" })}
      />
    ),
    children: (
      <ViewTemplate busy footer={<ShortcutBar />} emptyDetail={<TaskDetailEmpty />}>
        <ViewSkeleton heading={{ title: "Tomorrow", subtitle: "Thursday 22 October" }} />
      </ViewTemplate>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-busy", "true")
    await expect(canvas.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
    await expect(canvas.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument()
    await expect(canvas.getByText("Select a task to see its details")).toBeInTheDocument()
  },
}
