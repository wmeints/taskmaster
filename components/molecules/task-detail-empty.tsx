import { SquareCheckIcon } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"

// What the details panel shows while no task is open.
function TaskDetailEmpty() {
  return (
    <Empty className="border-0">
      <EmptyHeader>
        <EmptyMedia className="text-muted-foreground [&_svg]:size-6">
          <SquareCheckIcon aria-hidden />
        </EmptyMedia>
        <EmptyDescription>Select a task to see its details</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export { TaskDetailEmpty }
