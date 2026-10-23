import { CalendarIcon } from "lucide-react"

import { ListDot } from "@/components/atoms/list-dot"
import type { ListColor } from "@/lib/tasks/types"

// Under the quick add input: the deadline and list read from what the user typed, and how to write them.
function RecognisedBar({
  deadline,
  list,
}: {
  deadline: string | null
  list: { name: string; color: ListColor } | null
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 border-b px-3.5 py-2 text-xs text-muted-foreground">
      {(deadline || list) && <span>Recognised</span>}
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
      <span className="ml-auto whitespace-nowrap">
        Dates like “fri” · <span className="font-semibold text-foreground">#</span> for a list
      </span>
    </div>
  )
}

export { RecognisedBar }
