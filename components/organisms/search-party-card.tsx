import { CalendarIcon, CheckIcon } from "lucide-react"
import { cn } from "cn"

import { ListDot } from "@/components/atoms/list-dot"

const found = [
  "Check the Inbox",
  "Check Today, Tomorrow and Later",
  "Look under the couch cushions",
  "Ask the intern",
]

// A static, non-interactive list for the 404 page: every place was searched, the page is still missing.
function SearchPartyCard({ className }: { className?: string }) {
  return (
    <figure
      aria-label="A search party that found everything but this page"
      className={cn("rounded-xl border bg-card p-5 text-card-foreground shadow-2xl shadow-foreground/10", className)}
    >
      <div className="flex items-center gap-2.5">
        <ListDot color="orange" className="rounded-full" />
        <span className="text-sm font-semibold">Search party</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {found.length} of {found.length + 1} done
        </span>
      </div>
      <div aria-hidden className="mt-4 h-1 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${(found.length / (found.length + 1)) * 100}%` }} />
      </div>
      <div className="mt-2 divide-y text-sm">
        {found.map((title) => (
          <div key={title} className="flex items-center gap-3 py-2.5">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-primary text-primary-foreground">
              <CheckIcon aria-hidden className="size-3" />
            </span>
            <span className="text-muted-foreground line-through">{title}</span>
          </div>
        ))}
        <div className="flex gap-3 pt-3">
          <span className="mt-0.5 size-4 shrink-0 rounded-[4px] border border-input" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">Find the page you were looking for</span>
            <span className="inline-flex items-center gap-1 text-xs text-destructive">
              <CalendarIcon aria-hidden className="size-3.5" />
              Overdue since forever
            </span>
          </div>
        </div>
      </div>
    </figure>
  )
}

export { SearchPartyCard }
