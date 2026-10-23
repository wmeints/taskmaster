import Link from "next/link"
import { cn } from "cn"

import { hrefFor } from "@/lib/tasks/routes"
import { plannerViews, viewTitles, type View } from "@/lib/tasks/types"

// The deadline views as a row of pills, for switching between them on small screens.
function PlannerTabs({
  counts,
  active,
  pending = false,
  onNavigate,
  className,
}: {
  counts: Record<View, number>
  // The view on screen, if it is one of the planner's.
  active: View | null
  // The active view is still loading.
  pending?: boolean
  // Takes over navigation, e.g. to show a loading state.
  onNavigate?: (href: string) => void
  className?: string
}) {
  return (
    <nav aria-label="Planner" className={cn("-mx-5 overflow-x-auto border-b px-5 pb-4 [scrollbar-width:none]", className)}>
      <ul className="flex w-max gap-2">
        {plannerViews.map((view) => {
          const href = hrefFor({ view })
          const current = view === active
          return (
            <li key={view}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                aria-busy={(current && pending) || undefined}
                onNavigate={
                  onNavigate &&
                  ((event) => {
                    event.preventDefault()
                    onNavigate(href)
                  })
                }
                className={cn(
                  "flex h-10 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  current ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted",
                  current && pending && "opacity-70"
                )}
              >
                {viewTitles[view]} · {counts[view]}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { PlannerTabs }
