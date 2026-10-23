import { CalendarIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"

import { ListDot } from "@/components/atoms/list-dot"
import type { ListColor } from "@/lib/tasks/types"

// newList is a list that doesn't exist yet and will be created with the task.
export type Recognised = {
  deadline: string | null
  list: { name: string; color: ListColor } | null
  newList?: string
}

// Under the quick add input: the deadline and list read from what the user typed, and how to write them.
// The inline variant sits under a form field and leaves out the border and the hint.
function RecognisedBar({ deadline, list, newList, variant = "palette" }: Recognised & { variant?: "palette" | "inline" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        variant === "palette" ? "min-h-11 border-b px-3.5 py-2" : "px-1"
      )}
    >
      {(deadline || list || newList) && <span>Recognised</span>}
      {deadline && (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary/10 px-2 font-medium text-primary">
          <CalendarIcon aria-hidden className="size-3.5" />
          Deadline: {deadline}
        </span>
      )}
      {list && (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-md border bg-muted/60 px-2 font-medium text-foreground">
          <ListDot color={list.color} />
          List: {list.name}
        </span>
      )}
      {newList && (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-dashed bg-muted/60 px-2 font-medium text-foreground">
          <PlusIcon aria-hidden className="size-3.5" />
          New list: {newList}
        </span>
      )}
      {variant === "palette" && (
        <span className="ml-auto whitespace-nowrap">
          Dates like “fri” · <span className="font-semibold text-foreground">#</span> for a list
        </span>
      )}
    </div>
  )
}

export { RecognisedBar }
