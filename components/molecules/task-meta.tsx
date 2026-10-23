import { AlignLeftIcon, CalendarIcon, ListChecksIcon } from "lucide-react"
import { cn } from "cn"

import { ListDot } from "@/components/atoms/list-dot"
import { describeDue } from "@/lib/tasks/deadlines"
import type { Task } from "@/lib/tasks/types"

// The deadline, list, subtask progress and description marker under a task's title.
function TaskMeta({ task, today, className }: { task: Task; today: string; className?: string }) {
  const doneCount = task.subtasks.filter((subtask) => subtask.done).length
  const items = [
    task.due && (
      <span
        key="due"
        className={cn(
          "inline-flex items-center gap-1",
          task.due.date < today ? "text-destructive" : task.due.date === today && "text-primary"
        )}
      >
        <CalendarIcon aria-hidden className="size-3.5" />
        {describeDue(task.due, today)}
      </span>
    ),
    task.list && (
      <span key="list" className="inline-flex items-center gap-1.5">
        <ListDot color={task.list.color} />
        {task.list.name}
      </span>
    ),
    task.subtasks.length > 0 && (
      <span key="subtasks" title="Subtasks done" className="inline-flex items-center gap-1">
        <ListChecksIcon aria-hidden className="size-3.5" />
        {doneCount}/{task.subtasks.length}
      </span>
    ),
    task.description && (
      <span key="description" title="Has a description" className="inline-flex">
        <AlignLeftIcon aria-hidden className="size-3.5" />
      </span>
    ),
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <span className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-muted-foreground", className)}>
      {items}
    </span>
  )
}

export { TaskMeta }
