"use client"

import { useId, useState } from "react"
import { PlusIcon } from "lucide-react"

import { ListDot } from "@/components/atoms/list-dot"
import { AddListForm } from "@/components/molecules/add-list-form"
import { InvitationItem } from "@/components/molecules/invitation-item"
import { ListActionsMenu } from "@/components/molecules/list-actions-menu"
import { SidebarNavItem } from "@/components/molecules/sidebar-nav-item"
import { Button } from "@/components/ui/button"
import { hrefFor } from "@/lib/tasks/routes"
import type { Invitation } from "@/lib/sharing/types"
import type { ListValues } from "@/lib/tasks/schemas"
import type { List, Scope } from "@/lib/tasks/types"

type Result = Promise<{ error: string } | void>

// The user's lists with their open tasks, invitations to join other people's lists, and a form to add one.
function ListNav({
  lists,
  invitations = [],
  scope,
  pending = false,
  onNavigate,
  onCreateList,
  onShareList,
  onDeleteList,
  onLeaveList,
  onRespondToInvitation,
}: {
  lists: List[]
  // Shown when they can be answered with onRespondToInvitation.
  invitations?: Invitation[]
  // The view or list on screen, if any.
  scope: Scope | null
  // The list in scope is still loading.
  pending?: boolean
  // Takes over navigation to a list.
  onNavigate?: (href: string) => void
  onCreateList: (values: ListValues) => Promise<{ id: string } | { error: string }>
  // The actions for the user's own lists; deleting and leaving run after the user confirmed.
  onShareList?: (listId: string) => void
  onDeleteList?: (listId: string) => Result
  // The action for lists shared with the user.
  onLeaveList?: (listId: string) => Result
  onRespondToInvitation?: (inviteId: string, accept: boolean) => Result
}) {
  const [adding, setAdding] = useState(false)
  const headingId = useId()
  const invitationsId = useId()

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
      {onRespondToInvitation && invitations.length > 0 && (
        <>
          <h3 id={invitationsId} className="sr-only">
            Invitations
          </h3>
          <ul aria-labelledby={invitationsId} className="flex flex-col gap-1.5 pb-1">
            {invitations.map((invitation) => (
              <InvitationItem
                key={invitation.id}
                invitation={invitation}
                onRespond={(accept) => onRespondToInvitation(invitation.id, accept)}
              />
            ))}
          </ul>
        </>
      )}
      <ul className="flex flex-col gap-0.5">
        {lists.map((list) => {
          const href = hrefFor({ listId: list.id })
          const active = scope !== null && "listId" in scope && scope.listId === list.id
          const actions = list.owned
            ? {
                onShare: onShareList && (() => onShareList(list.id)),
                onDelete: onDeleteList && (() => onDeleteList(list.id)),
              }
            : { onLeave: onLeaveList && (() => onLeaveList(list.id)) }
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
              action={
                Object.values(actions).some(Boolean) && <ListActionsMenu listName={list.name} {...actions} />
              }
            />
          )
        })}
      </ul>
      {adding && <AddListForm onAdd={createList} onCancel={() => setAdding(false)} />}
    </nav>
  )
}

export { ListNav }
