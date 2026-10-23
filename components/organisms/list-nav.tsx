"use client"

import { useId, useState } from "react"
import { PlusIcon } from "lucide-react"

import { ListDot } from "@/components/atoms/list-dot"
import { AddListForm } from "@/components/molecules/add-list-form"
import { ListActionsMenu } from "@/components/molecules/list-actions-menu"
import { SidebarNavItem } from "@/components/molecules/sidebar-nav-item"
import { Button } from "@/components/ui/button"
import { hrefFor } from "@/lib/tasks/routes"
import type { ListValues } from "@/lib/tasks/schemas"
import type { List, Scope } from "@/lib/tasks/types"

// The user's lists with their open tasks, and a form to add one.
function ListNav({
  lists,
  scope,
  pending = false,
  onNavigate,
  onCreateList,
  onDeleteList,
}: {
  lists: List[]
  // The view or list on screen, if any.
  scope: Scope | null
  // The list in scope is still loading.
  pending?: boolean
  // Takes over navigation to a list.
  onNavigate?: (href: string) => void
  onCreateList: (values: ListValues) => Promise<{ id: string } | { error: string }>
  // Deletes a list after the user confirmed it; the lists get no actions menu without it.
  onDeleteList?: (listId: string) => Promise<{ error: string } | void>
}) {
  const [adding, setAdding] = useState(false)
  const headingId = useId()

  async function createList(values: ListValues) {
    const result = await onCreateList(values)
    if (!("error" in result)) setAdding(false)
    return result
  }

  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-1">
      <div className="flex items-center justify-between pr-1">
        <h2 id={headingId} className="px-2.5 text-xs font-medium text-muted-foreground">
          Lists
        </h2>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="New list"
          className="text-muted-foreground"
          onClick={() => setAdding(true)}
        >
          <PlusIcon />
        </Button>
      </div>
      <ul className="flex flex-col gap-0.5">
        {lists.map((list) => {
          const href = hrefFor({ listId: list.id })
          const active = scope !== null && "listId" in scope && scope.listId === list.id
          return (
            <SidebarNavItem
              key={list.id}
              href={href}
              active={active}
              pending={active && pending}
              onNavigate={onNavigate && (() => onNavigate(href))}
              label={list.name}
              count={list.openCount}
              leading={<ListDot color={list.color} />}
              action={onDeleteList && <ListActionsMenu listName={list.name} onDelete={() => onDeleteList(list.id)} />}
            />
          )
        })}
      </ul>
      {adding && <AddListForm onAdd={createList} onCancel={() => setAdding(false)} />}
    </nav>
  )
}

export { ListNav }
