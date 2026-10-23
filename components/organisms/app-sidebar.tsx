"use client"

import { useId } from "react"
import {
  CalendarDaysIcon,
  ClockIcon,
  InboxIcon,
  KeyboardIcon,
  SunIcon,
  SunriseIcon,
  type LucideIcon,
} from "lucide-react"

import { AccountMenu } from "@/components/molecules/account-menu"
import { Logo } from "@/components/molecules/logo"
import { SearchTrigger } from "@/components/molecules/search-trigger"
import { SidebarNavItem } from "@/components/molecules/sidebar-nav-item"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { hrefFor } from "@/lib/tasks/routes"
import { viewTitles, type List, type Scope, type View } from "@/lib/tasks/types"

import { ListNav } from "./list-nav"

const viewIcons: Record<View, LucideIcon> = {
  inbox: InboxIcon,
  today: SunIcon,
  tomorrow: SunriseIcon,
  "end-of-week": CalendarDaysIcon,
  later: ClockIcon,
}

function AppSidebar({
  counts,
  lists,
  scope,
  pending = false,
  account,
  signOutAction,
  onSearch,
  onShowShortcuts,
  onCreateList,
  onDeleteList,
  onNavigate,
}: {
  counts: Record<View, number>
  lists: List[]
  // The view or list on screen, if any.
  scope: Scope | null
  // The view or list in scope is still loading.
  pending?: boolean
  account: React.ComponentProps<typeof AccountMenu>["account"]
  signOutAction: () => Promise<void>
  onSearch: () => void
  onShowShortcuts: () => void
  onCreateList: React.ComponentProps<typeof ListNav>["onCreateList"]
  onDeleteList?: React.ComponentProps<typeof ListNav>["onDeleteList"]
  // Takes over navigation to a view or list.
  onNavigate?: (href: string) => void
}) {
  const viewsId = useId()

  function item(href: string, active: boolean) {
    return {
      href,
      active,
      pending: active && pending,
      onNavigate: onNavigate && (() => onNavigate(href)),
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 p-3">
      <Logo className="px-2 pt-2 text-[0.95rem]" />
      <SearchTrigger onClick={onSearch} />

      <nav aria-labelledby={viewsId} className="flex flex-col gap-1">
        <h2 id={viewsId} className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
          Views
        </h2>
        <ul className="flex flex-col gap-0.5">
          {(Object.keys(viewTitles) as View[]).map((view) => {
            const Icon = viewIcons[view]
            return (
              <SidebarNavItem
                key={view}
                {...item(hrefFor({ view }), scope !== null && "view" in scope && scope.view === view)}
                label={viewTitles[view]}
                count={counts[view]}
                leading={<Icon aria-hidden />}
              />
            )
          })}
        </ul>
      </nav>

      <ListNav
        lists={lists}
        scope={scope}
        pending={pending}
        onNavigate={onNavigate}
        onCreateList={onCreateList}
        onDeleteList={onDeleteList}
      />

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onShowShortcuts}
          aria-keyshortcuts="Shift+?"
          className="flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <KeyboardIcon aria-hidden className="size-4 text-muted-foreground" />
          <span className="flex-1 text-left">Keyboard shortcuts</span>
          <Kbd aria-hidden className="border bg-background">
            ?
          </Kbd>
        </button>
        <Separator />
        <AccountMenu account={account} signOutAction={signOutAction} />
      </div>
    </div>
  )
}

export { AppSidebar }
