"use client"

import Link from "next/link"
import { CalendarIcon, EllipsisIcon, HashIcon, InboxIcon, type LucideIcon } from "lucide-react"

import { hrefFor } from "@/lib/tasks/routes"

export type MobileTab = "inbox" | "planner" | "lists"

const tabClassName =
  "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground outline-none focus-visible:text-foreground data-[active=true]:text-primary [&_svg]:size-5"

// The tabs at the bottom of the screen on small screens. The inbox and the planner are pages; the lists
// and everything else open in a sheet.
function MobileTabBar({
  active,
  onNavigate,
  onShowLists,
  onShowMore,
}: {
  // The tab the view on screen belongs to.
  active: MobileTab | null
  // Takes over navigation, e.g. to show a loading state.
  onNavigate?: (href: string) => void
  onShowLists: () => void
  onShowMore: () => void
}) {
  function link(tab: MobileTab, href: string, label: string, Icon: LucideIcon) {
    return (
      <Link
        href={href}
        aria-current={active === tab ? "page" : undefined}
        data-active={active === tab}
        onNavigate={
          onNavigate &&
          ((event) => {
            event.preventDefault()
            onNavigate(href)
          })
        }
        className={tabClassName}
      >
        <Icon aria-hidden />
        {label}
      </Link>
    )
  }

  function button(label: string, Icon: LucideIcon, onClick: () => void, isActive = false) {
    return (
      <button type="button" data-active={isActive} onClick={onClick} className={tabClassName}>
        <Icon aria-hidden />
        {label}
      </button>
    )
  }

  return (
    <nav aria-label="Sections" className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {link("inbox", hrefFor({ view: "inbox" }), "Inbox", InboxIcon)}
        {link("planner", hrefFor({ view: "today" }), "Planner", CalendarIcon)}
        {button("Lists", HashIcon, onShowLists, active === "lists")}
        {button("More", EllipsisIcon, onShowMore)}
      </div>
    </nav>
  )
}

export { MobileTabBar }
