"use client"

import { InlineAddForm } from "@/components/molecules/inline-add-form"
import { ViewHeader } from "@/components/molecules/view-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { Heading } from "@/lib/tasks/headings"
import { newTaskSchema } from "@/lib/tasks/schemas"

import { TaskListSkeleton } from "./task-list-skeleton"

const noop = () => {}

// A view while its tasks load. The heading is shown when it is already known, so switching views
// updates the title straight away; the controls are inert until the real view takes over.
function ViewSkeleton({
  heading,
  tabs,
}: {
  heading: Heading | null
  // The pills for switching views on small screens, when the view has them.
  tabs?: React.ReactNode
}) {
  return (
    <div inert className="flex flex-col gap-6">
      {heading ? (
        <>
          <ViewHeader title={heading.title} subtitle={heading.subtitle} onNewTask={noop} />
          {tabs}
          <div className="max-md:hidden">
            <InlineAddForm
              label="New task"
              placeholder={`Add a task to ${heading.title}…`}
              schema={newTaskSchema}
              onAdd={async () => {}}
            />
          </div>
        </>
      ) : (
        <>
          <div aria-hidden className="flex flex-col gap-2.5 py-1.5">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3.5 w-28 rounded-full" />
          </div>
          <Skeleton aria-hidden className="h-11 rounded-lg" />
        </>
      )}
      <TaskListSkeleton />
    </div>
  )
}

export { ViewSkeleton }
