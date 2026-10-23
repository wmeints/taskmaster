"use client"

import { useState } from "react"
import {
  CalendarDaysIcon,
  ClockIcon,
  InboxIcon,
  KeyboardIcon,
  PlusIcon,
  SunIcon,
  SunriseIcon,
  type LucideIcon,
} from "lucide-react"

import { ListDot } from "@/components/atoms/list-dot"
import { AccountMenu } from "@/components/molecules/account-menu"
import { AddListForm } from "@/components/molecules/add-list-form"
import { ListActionsMenu } from "@/components/molecules/list-actions-menu"
import { Logo } from "@/components/molecules/logo"
import { SearchTrigger } from "@/components/molecules/search-trigger"
import { SidebarNavItem } from "@/components/molecules/sidebar-nav-item"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { hrefFor } from "@/lib/tasks/routes"
import type { ListValues } from "@/lib/tasks/schemas"
import { viewTitles, type List, type Scope, type View } from "@/lib/tasks/types"

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
  onCreateList: (values: ListValues) => Promise<{ id: string } | { error: string }>
  // Deletes a list after the user confirmed it; the lists get no actions menu without it.
  onDeleteList?: (listId: string) => Promise<{ error: string } | void>
  // Takes over navigation to a view or list.
  onNavigate?: (href: string) => void
}) {
  const [addingList, setAddingList] = useState(false)

  function item(href: string, active: boolean) {
    return {
      href,
      active,
      pending: active && pending,
      onNavigate: onNavigate && (() => onNavigate(href)),
    }
  }

  async function createList(values: ListValues) {
    const result = await onCreateList(values)
    if (!("error" in result)) setAddingList(false)
    return result
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 p-3">
      <Logo className="px-2 pt-2 text-[0.95rem]" />
      <SearchTrigger onClick={onSearch} />

      <nav aria-labelledby="sidebar-views" className="flex flex-col gap-1">
        <h2 id="sidebar-views" className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">
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

      <nav aria-labelledby="sidebar-lists" className="flex flex-col gap-1">
        <div className="flex items-center justify-between pr-1">
          <h2 id="sidebar-lists" className="px-2.5 text-xs font-medium text-muted-foreground">
            Lists
          </h2>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="New list"
            className="text-muted-foreground"
            onClick={() => setAddingList(true)}
          >
            <PlusIcon />
          </Button>
        </div>
        <ul className="flex flex-col gap-0.5">
          {lists.map((list) => (
            <SidebarNavItem
              key={list.id}
              {...item(hrefFor({ listId: list.id }), scope !== null && "listId" in scope && scope.listId === list.id)}
              label={list.name}
              count={list.openCount}
              leading={<ListDot color={list.color} />}
              action={
                onDeleteList && <ListActionsMenu listName={list.name} onDelete={() => onDeleteList(list.id)} />
              }
            />
          ))}
        </ul>
        {addingList && <AddListForm onAdd={createList} onCancel={() => setAddingList(false)} />}
      </nav>

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
