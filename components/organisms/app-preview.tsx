import { cn } from "cn"

import { Kbd } from "@/components/ui/kbd"

const views = [
  { name: "Inbox", count: 3 },
  { name: "Today", count: 3, active: true },
  { name: "Tomorrow", count: 2 },
  { name: "End of week", count: 2 },
  { name: "Later", count: 2 },
]

const lists = [
  { name: "Website relaunch", color: "bg-blue-500" },
  { name: "Home renovation", color: "bg-orange-500" },
]

const tasks = [
  {
    title: "Review pull request for checkout flow",
    due: "Today, 14:00",
    meta: "Website relaunch · 1/3",
    selected: true,
  },
  { title: "Call the plumber about the kitchen tap", meta: "Home renovation" },
  { title: "Draft release notes", meta: "Today, 17:00 · Website relaunch · 0/2" },
]

// A static, non-interactive picture of the Today view used to illustrate the app.
function AppPreview({ className }: { className?: string }) {
  return (
    <figure
      aria-label="Preview of the Taskmaster Today view"
      className={cn("relative pb-6", className)}
    >
      <div
        aria-hidden
        className="flex overflow-hidden rounded-xl border bg-background text-xs shadow-2xl ring-8 ring-muted/60"
      >
        <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r bg-muted/50 p-2 sm:flex">
          <p className="px-2 pt-1 pb-1 text-[0.65rem] text-muted-foreground">Views</p>
          {views.map((view) => (
            <div
              key={view.name}
              className={cn(
                "flex justify-between rounded-md px-2 py-1.5",
                view.active && "bg-muted font-semibold"
              )}
            >
              {view.name}
              <span className="text-muted-foreground">{view.count}</span>
            </div>
          ))}
          <p className="px-2 pt-3 pb-1 text-[0.65rem] text-muted-foreground">Lists</p>
          {lists.map((list) => (
            <div key={list.name} className="flex items-center gap-2 px-2 py-1.5 whitespace-nowrap">
              <span className={cn("size-1.5 rounded-[1px]", list.color)} />
              {list.name}
            </div>
          ))}
        </aside>
        <div className="flex flex-1 flex-col gap-3 p-3">
          <p className="text-base font-semibold">Today</p>
          <div className="rounded-md border px-2 py-1.5 text-muted-foreground">
            + Add a task to Today…
          </div>
          <p className="text-[0.65rem] font-semibold">To do</p>
          <ul className="flex flex-col gap-1">
            {tasks.map((task) => (
              <li
                key={task.title}
                className={cn(
                  "flex gap-2 rounded-md border border-transparent px-2 py-2",
                  task.selected && "border-primary/50 bg-muted/50 ring-2 ring-primary/10"
                )}
              >
                <span className="mt-px size-3 shrink-0 rounded-[3px] border border-foreground/40" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {task.due && <span className="font-medium text-primary">{task.due} · </span>}
                    {task.meta}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t pt-2 text-[0.65rem]">
            <span className="font-semibold">Completed · 2</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              Hide <Kbd className="h-4 min-w-4 border bg-background text-[0.6rem]">H</Kbd>
            </span>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="dark absolute right-0 bottom-0 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-foreground shadow-lg sm:-right-2"
      >
        <Kbd className="border">X</Kbd>
        Marked complete
      </div>
    </figure>
  )
}

export { AppPreview }
