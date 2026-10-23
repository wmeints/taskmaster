import { TaskRowSkeleton } from "@/components/molecules/task-row-skeleton"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

// Varied widths, so the placeholder reads as a list of different tasks.
const rows = [
  { titleWidth: "58%", metaWidth: "32%" },
  { titleWidth: "45%", metaWidth: "21%" },
  { titleWidth: "66%", metaWidth: "35%" },
  { titleWidth: "38%", metaWidth: "24%" },
  { titleWidth: "51%", metaWidth: "28%" },
]

// A placeholder shaped like the task list, shown while a view's tasks load.
function TaskListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 py-0.5">
          <Skeleton className="h-3 w-11 rounded-full" />
          <Skeleton className="h-4 w-6.5 rounded-full" />
        </div>
        <ul className="flex flex-col gap-0.5">
          {rows.map((row, index) => (
            <TaskRowSkeleton key={index} {...row} />
          ))}
        </ul>
      </div>
      <Separator />
      <Skeleton className="mx-1 h-3 w-19 rounded-full" />
    </div>
  )
}

export { TaskListSkeleton }
