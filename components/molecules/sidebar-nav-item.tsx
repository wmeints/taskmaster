import Link from "next/link"
import { cn } from "cn"

import { Spinner } from "@/components/ui/spinner"

// A view or list in the sidebar, with the number of open tasks in it.
function SidebarNavItem({
  href,
  label,
  count,
  leading,
  trailing,
  active = false,
  pending = false,
  onNavigate,
}: {
  href: string
  label: string
  count: number
  leading: React.ReactNode
  trailing?: React.ReactNode
  active?: boolean
  // The item's view is loading; shows a spinner in place of the count.
  pending?: boolean
  // Takes over client-side navigation, e.g. to show a loading state. Opening in a new tab still works.
  onNavigate?: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        aria-busy={pending || undefined}
        onNavigate={
          onNavigate &&
          ((event) => {
            event.preventDefault()
            onNavigate()
          })
        }
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-sidebar-foreground transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
          active && "bg-sidebar-accent font-semibold"
        )}
      >
        <span className="flex w-4 justify-center">{leading}</span>
        <span className="flex-1 truncate">{label}</span>
        {trailing}
        {pending ? (
          <Spinner className="size-3.5! text-primary!" />
        ) : (
          count > 0 && <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
        )}
      </Link>
    </li>
  )
}

export { SidebarNavItem }
