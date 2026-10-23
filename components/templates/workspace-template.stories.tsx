import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect } from "storybook/test"

import { PlusIcon } from "lucide-react"

import { MobileTopBar } from "@/components/molecules/mobile-top-bar"
import { PlannerTabs } from "@/components/molecules/planner-tabs"
import { ViewHeader } from "@/components/molecules/view-header"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import { MobileTabBar } from "@/components/organisms/mobile-tab-bar"
import { ShortcutBar } from "@/components/organisms/shortcut-bar"
import { ViewSkeleton } from "@/components/organisms/view-skeleton"
import { TaskList } from "@/components/organisms/task-list"
import { workspace } from "@/components/organisms/workspace.fixtures"
import { Button } from "@/components/ui/button"

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

// Small screens swap the sidebar for a bar above the view and tabs below it.
export const Mobile: Story = {
  args: { header: <div>Top bar</div>, tabBar: <div>Tab bar</div> },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Top bar")).toBeInTheDocument()
    await expect(canvas.getByText("Tab bar")).toBeInTheDocument()
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
      <ViewTemplate busy footer={<ShortcutBar />}>
        <ViewSkeleton heading={{ title: "Tomorrow", subtitle: "Thursday 22 October" }} />
      </ViewTemplate>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Tomorrow/ })).toHaveAttribute("aria-busy", "true")
    await expect(canvas.getByRole("heading", { level: 1, name: "Tomorrow" })).toBeInTheDocument()
    await expect(canvas.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument()
  },
}

const noop = () => {}

// The Today view on a phone, from the design.
export const MobileToday: Story = {
  parameters: { nextjs: { appDirectory: true } },
  decorators: [(Story) => <div className="w-[390px] overflow-hidden border">{Story()}</div>],
  args: {
    sidebar: null,
    header: <MobileTopBar onOpenMenu={noop} onSearch={noop} />,
    tabBar: <MobileTabBar active="planner" onShowLists={noop} onShowMore={noop} />,
    children: (
      <ViewTemplate
        footer={<ShortcutBar />}
        action={
          <Button size="icon-lg" aria-label="Add task" className="size-14 rounded-2xl shadow-lg">
            <PlusIcon className="size-6" />
          </Button>
        }
      >
        <ViewHeader title="Today" subtitle="Wednesday 21 October" onNewTask={noop} />
        <PlannerTabs className="md:hidden" counts={workspace.counts} active="today" />
        <TaskList
          todo={workspace.todo}
          completed={workspace.completed}
          today={workspace.today}
          selectedId={null}
          hideCompleted
          onToggleHideCompleted={noop}
          onSelect={noop}
          onToggle={noop}
          onDelete={noop}
        />
      </ViewTemplate>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument()
    await expect(canvas.getByText(`Today · ${workspace.counts.today}`)).toBeInTheDocument()
  },
}

