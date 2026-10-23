"use client"

import { useId } from "react"
import { CheckIcon, DeleteIcon, RotateCcwIcon, Trash2Icon, XIcon } from "lucide-react"

import { DeadlinePicker } from "@/components/molecules/deadline-picker"
import { InlineAddForm } from "@/components/molecules/inline-add-form"
import { SubtaskItem } from "@/components/molecules/subtask-item"
import { TaskDetailsForm } from "@/components/molecules/task-details-form"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Progress } from "@/components/ui/progress"
import { isPending } from "@/lib/tasks/optimistic"
import { subtaskSchema, type SubtaskValues, type TaskChanges } from "@/lib/tasks/schemas"
import type { List, Task } from "@/lib/tasks/types"

// Everything about one task, edited in place.
function TaskDetail({
  task,
  lists,
  today,
  breadcrumb,
  onClose,
  onChange,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  deadlineRef,
  subtaskInputRef,
}: {
  task: Task
  lists: List[]
  today: string
  breadcrumb: string
  onClose: () => void
  onChange: (changes: TaskChanges) => Promise<{ error: string } | unknown>
  onDelete: () => void
  onAddSubtask: (values: SubtaskValues) => Promise<{ error: string } | unknown>
  onToggleSubtask: (subtaskId: string, done: boolean) => void
  onDeleteSubtask: (subtaskId: string) => void
  deadlineRef?: React.Ref<HTMLButtonElement>
  subtaskInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const listId = useId()
  const doneCount = task.subtasks.filter((subtask) => subtask.done).length

  return (
    <div className="flex h-full w-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
        <Button variant="outline" size="icon" aria-label="Close" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      {/* Remount per task so the form starts from that task's values. */}
      <TaskDetailsForm key={task.id} title={task.title} description={task.description} onSave={onChange} />

      <section aria-labelledby="task-detail-deadline" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 id="task-detail-deadline" className="text-sm font-medium">
            Deadline <span className="font-normal text-muted-foreground">· optional</span>
          </h3>
          <Kbd className="border bg-background">D</Kbd>
        </div>
        <DeadlinePicker
          due={task.due}
          today={today}
          onChange={(due) => onChange({ due })}
          firstButtonRef={deadlineRef}
        />
      </section>

      <div className="flex flex-col gap-2.5">
        <Label htmlFor={listId}>List</Label>
        <NativeSelect
          id={listId}
          className="w-full"
          value={task.list?.id ?? ""}
          onChange={(event) => onChange({ listId: event.target.value || null })}
        >
          <NativeSelectOption value="">No list</NativeSelectOption>
          {lists.map((list) => (
            <NativeSelectOption key={list.id} value={list.id}>
              {list.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <section aria-labelledby="task-detail-subtasks" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 id="task-detail-subtasks" className="text-sm font-medium">
            Subtasks
            {task.subtasks.length > 0 && (
              <span className="font-normal text-muted-foreground">{` · ${doneCount} of ${task.subtasks.length} done`}</span>
            )}
          </h3>
          <Kbd className="border bg-background">S</Kbd>
        </div>
        {task.subtasks.length > 0 && (
          <>
            <Progress value={Math.round((doneCount / task.subtasks.length) * 100)} aria-label="Subtasks done" />
            <ul className="flex flex-col">
              {task.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  saving={isPending(subtask)}
                  onToggle={(done) => onToggleSubtask(subtask.id, done)}
                  onDelete={() => onDeleteSubtask(subtask.id)}
                />
              ))}
            </ul>
          </>
        )}
        <InlineAddForm
          key={task.id}
          label="New subtask"
          placeholder="Add a subtask, press Enter"
          schema={subtaskSchema}
          onAdd={onAddSubtask}
          inputRef={subtaskInputRef}
          variant="dashed"
        />
      </section>

      <div className="mt-auto flex gap-2 border-t pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onDelete}
          aria-keyshortcuts="Backspace"
          className="gap-2 border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
        >
          <Trash2Icon data-icon="inline-start" />
          Delete
          <Kbd aria-hidden className="border border-primary/30 bg-transparent text-primary">
            <DeleteIcon />
          </Kbd>
        </Button>
        <Button
          size="lg"
          onClick={() => onChange({ completed: !task.completed })}
          aria-keyshortcuts="X"
          className="flex-1 gap-2"
        >
          {task.completed ? <RotateCcwIcon data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
          {task.completed ? "Mark incomplete" : "Mark complete"}
          <Kbd aria-hidden className="border border-primary-foreground/40 bg-transparent text-primary-foreground">
            X
          </Kbd>
        </Button>
      </div>
    </div>
  )
}

export { TaskDetail }
