"use client"

import { useRef, useState } from "react"
import { Trash2Icon } from "lucide-react"
import { cn } from "cn"

import { TaskMeta } from "@/components/molecules/task-meta"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/tasks/types"

// How far a swipe slides the row open to show the delete button.
const deleteWidth = 96

type Swipe = { x: number; y: number; from: number; horizontal: boolean | null }

// A task in the list: a checkbox to complete it and its title and details to open it. On touch screens,
// swiping it to the left reveals a delete button.
function TaskRow({
  task,
  today,
  selected,
  onSelect,
  onToggle,
  onDelete,
}: {
  task: Task
  today: string
  selected: boolean
  onSelect: () => void
  onToggle: (completed: boolean) => void
  // Makes the row swipeable.
  onDelete?: () => void
}) {
  // 0 when closed, -deleteWidth when open, in between while the finger moves.
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const swipe = useRef<Swipe | null>(null)
  // Set when a gesture ends, so the click that follows it doesn't open the task.
  const swallowClick = useRef(false)

  function onPointerDown(event: React.PointerEvent) {
    swallowClick.current = false
    if (!onDelete || event.pointerType === "mouse") return
    swipe.current = { x: event.clientX, y: event.clientY, from: offset, horizontal: null }
  }

  function onPointerMove(event: React.PointerEvent) {
    const current = swipe.current
    if (!current) return
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y
    // Wait until the finger has clearly moved, then decide: sideways swipes the row, anything else scrolls.
    if (current.horizontal === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      current.horizontal = Math.abs(dx) > Math.abs(dy)
      if (!current.horizontal) {
        swipe.current = null
        return
      }
      setDragging(true)
    }
    setOffset(Math.min(0, Math.max(-deleteWidth * 1.5, current.from + dx)))
  }

  function onPointerEnd() {
    const current = swipe.current
    swipe.current = null
    if (!current?.horizontal) return
    setDragging(false)
    swallowClick.current = true
    setOffset((value) => (value < -deleteWidth / 2 ? -deleteWidth : 0))
  }

  return (
    <li
      data-selected={selected}
      data-task-id={task.id}
      onClick={onSelect}
      onClickCapture={(event) => {
        // A tap on an open row closes it instead of opening the task.
        if (swallowClick.current || offset !== 0) {
          if (!(event.target as Element).closest("[data-swipe-action]")) {
            event.stopPropagation()
            setOffset(0)
          }
        }
        swallowClick.current = false
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className={cn(
        "relative scroll-my-4 touch-pan-y overflow-hidden rounded-lg border border-transparent transition-colors hover:bg-muted/50",
        "max-md:rounded-none max-md:border-0 max-md:border-b max-md:border-border max-md:hover:bg-transparent",
        selected && "border-primary/40 bg-muted/60 ring-2 ring-primary/10 hover:bg-muted/60 max-md:ring-0"
      )}
    >
      {offset < 0 && (
        <button
          type="button"
          data-swipe-action
          onClick={(event) => {
            event.stopPropagation()
            setOffset(0)
            onDelete?.()
          }}
          style={{ width: Math.max(deleteWidth, -offset) }}
          className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-destructive text-sm font-medium text-white"
        >
          <Trash2Icon aria-hidden className="size-4" />
          Delete
        </button>
      )}
      <div
        style={offset !== 0 ? { transform: `translateX(${offset}px)` } : undefined}
        className={cn(
          "relative flex items-start gap-3 px-3 py-3 max-md:px-1 max-md:py-3.5",
          offset !== 0 && "bg-background",
          !dragging && "transition-transform duration-200"
        )}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(checked)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
          className="mt-0.5 size-4.5 border-foreground/30 max-md:size-5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect()
            }}
            className={cn(
              "truncate text-left text-sm font-medium outline-none focus-visible:underline max-md:text-base",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </button>
          {!task.completed && <TaskMeta task={task} today={today} />}
        </div>
      </div>
    </li>
  )
}

export { TaskRow }
