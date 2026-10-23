import { CalendarIcon, CheckIcon } from "lucide-react"
import { cn } from "cn"

import { ListDot } from "@/components/atoms/list-dot"
import { Badge } from "@/components/ui/badge"

const done = ["Write the code", "Deploy on a Friday afternoon"]

// A static, non-interactive list for the 500 page: the server has put the user's problem on its todo list.
function ServerTodoCard({ className }: { className?: string }) {
  return (
    <figure
      aria-label="The server’s todo list, with your problem on it"
      className={cn("rounded-xl border bg-card p-5 text-card-foreground shadow-2xl shadow-foreground/10", className)}
    >
      <div className="flex items-center gap-2.5">
        <ListDot color="blue" className="rounded-full" />
        <span className="text-sm font-semibold">The server’s todo list</span>
        <span className="ml-auto text-xs text-muted-foreground">2 of 4 done</span>
      </div>
      <div className="mt-2 divide-y text-sm">
        {done.map((title) => (
          <div key={title} className="flex items-center gap-3 py-2.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-primary text-primary-foreground">
              <CheckIcon aria-hidden className="size-3" />
            </span>
            <span className="text-muted-foreground line-through">{title}</span>
          </div>
        ))}
        <div className="flex gap-3 py-2.5">
          <span className="mt-0.5 size-4 shrink-0 rounded-[4px] border border-input" />
          <div className="flex flex-col gap-1">
            <span>Test it first</span>
            <span className="text-xs text-muted-foreground">Moved to Later · 14 times</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <span className="mt-0.5 size-4 shrink-0 rounded-[4px] border border-primary/60" />
        <div className="flex flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            Fix whatever you just ran into
            <Badge>New</Badge>
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-destructive">
              <CalendarIcon aria-hidden className="size-3.5" />
              Due right now
            </span>
            Assigned to whoever is on call
          </span>
        </div>
      </div>
    </figure>
  )
}

export { ServerTodoCard }
