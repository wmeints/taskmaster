"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"

import { SectionHeading } from "@/components/molecules/section-heading"
import { TaskRow } from "@/components/molecules/task-row"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import type { Task } from "@/lib/tasks/types"

// The open tasks of a view, followed by the ones completed recently.
function TaskList({
  todo,
  completed,
  today,
  selectedId,
  hideCompleted,
  onToggleHideCompleted,
  onSelect,
  onToggle,
  onDelete,
}: {
  todo: Task[]
  completed: Task[]
  today: string
  selectedId: string | null
  hideCompleted: boolean
  onToggleHideCompleted: () => void
  onSelect: (taskId: string) => void
  onToggle: (taskId: string, completed: boolean) => void
  // Lets rows be swiped away on touch screens.
  onDelete?: (taskId: string) => void
}) {
  const rows = (tasks: Task[]) => (
    <ul className="flex flex-col gap-0.5 max-md:gap-0">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          selected={task.id === selectedId}
          onSelect={() => onSelect(task.id)}
          onToggle={(done) => onToggle(task.id, done)}
          onDelete={onDelete && (() => onDelete(task.id))}
        />
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="task-list-todo" className="flex flex-col gap-2">
        <div id="task-list-todo">
          <SectionHeading title="To do" count={todo.length} />
        </div>
        {todo.length > 0 ? rows(todo) : <p className="px-1 py-6 text-sm text-muted-foreground">Nothing to do here.</p>}
      </section>

      {completed.length > 0 && (
        <>
          <Separator className="max-md:hidden" />
          <section aria-labelledby="task-list-completed" className="flex flex-col gap-2">
            <div id="task-list-completed">
              <SectionHeading
                title="Completed"
                count={completed.length}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleHideCompleted}
                    aria-keyshortcuts="H"
                    className="text-muted-foreground"
                  >
                    {hideCompleted ? <EyeIcon data-icon="inline-start" /> : <EyeOffIcon data-icon="inline-start" />}
                    {hideCompleted ? "Show" : "Hide"}
                    <Kbd aria-hidden className="border bg-background max-md:hidden">
                      H
                    </Kbd>
                  </Button>
                }
              />
            </div>
            {!hideCompleted && rows(completed)}
          </section>
        </>
      )}
    </div>
  )
}

export { TaskList }
