"use client"

import { useId } from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Subtask } from "@/lib/tasks/types"

function SubtaskItem({
  subtask,
  onToggle,
  onDelete,
}: {
  subtask: Subtask
  onToggle: (done: boolean) => void
  onDelete: () => void
}) {
  const id = useId()

  return (
    <li className="group/subtask flex items-center gap-3 rounded-md px-2.5 py-1.5 hover:bg-muted/50">
      <Checkbox
        id={id}
        checked={subtask.done}
        onCheckedChange={(checked) => onToggle(checked)}
        className="border-foreground/30"
      />
      <label
        htmlFor={id}
        className={cn("flex-1 text-sm", subtask.done && "text-muted-foreground line-through")}
      >
        {subtask.title}
      </label>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDelete}
        aria-label={`Delete subtask ${subtask.title}`}
        className="text-muted-foreground"
      >
        <XIcon />
      </Button>
    </li>
  )
}

export { SubtaskItem }
