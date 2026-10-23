import { Skeleton } from "@/components/ui/skeleton"

// A placeholder shaped like a task row: a checkbox, a title and a line of details.
function TaskRowSkeleton({ titleWidth, metaWidth }: { titleWidth: string; metaWidth: string }) {
  return (
    <li className="flex items-start gap-3 px-3 py-3">
      <Skeleton className="mt-0.5 size-4.5 rounded-[4px]" />
      <div className="flex flex-1 flex-col gap-2 pt-0.5">
        <Skeleton className="h-3 rounded-full" style={{ width: titleWidth }} />
        <Skeleton className="h-2.5 rounded-full opacity-70" style={{ width: metaWidth }} />
      </div>
    </li>
  )
}

export { TaskRowSkeleton }
