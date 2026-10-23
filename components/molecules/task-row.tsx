"use client"

import { cn } from "cn"

import { TaskMeta } from "@/components/molecules/task-meta"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/tasks/types"

// A task in the list: a checkbox to complete it and its title and details to open it.
function TaskRow({
  task,
  today,
  selected,
  onSelect,
  onToggle,
}: {
  task: Task
  today: string
  selected: boolean
  onSelect: () => void
  onToggle: (completed: boolean) => void
}) {
  return (
    <li
      data-selected={selected}
      data-task-id={task.id}
      onClick={onSelect}
      className={cn(
        "flex scroll-my-4 items-start gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors hover:bg-muted/50",
        selected && "border-primary/40 bg-muted/60 ring-2 ring-primary/10 hover:bg-muted/60"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(checked)}
        onClick={(event) => event.stopPropagation()}
        aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
        className="mt-0.5 size-4.5 border-foreground/30"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect()
          }}
          className={cn(
            "truncate text-left text-sm font-medium outline-none focus-visible:underline",
            task.completed && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </button>
        {!task.completed && <TaskMeta task={task} today={today} />}
      </div>
    </li>
  )
}

export { TaskRow }
