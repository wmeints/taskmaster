"use client"

import { useState, useTransition } from "react"
import { MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Invitation } from "@/lib/sharing/types"

// An invitation to join someone else's list, answered right from the sidebar.
function InvitationItem({
  invitation,
  onRespond,
}: {
  invitation: Invitation
  onRespond: (accept: boolean) => Promise<{ error: string } | void>
}) {
  const [error, setError] = useState<string | null>(null)
  const [responding, startResponse] = useTransition()

  function respond(accept: boolean) {
    setError(null)
    startResponse(async () => {
      const result = await onRespond(accept)
      if (result && "error" in result) setError(result.error)
    })
  }

  return (
    <li className="flex gap-2.5 rounded-lg border bg-background px-2.5 py-2">
      <MailIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <span className="truncate text-sm font-medium">{invitation.listName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {invitation.invitedBy ? `${invitation.invitedBy} invited you` : "You're invited"}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            size="xs"
            disabled={responding}
            aria-label={`Accept the invite to ${invitation.listName}`}
            onClick={() => respond(true)}
          >
            Accept
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={responding}
            aria-label={`Decline the invite to ${invitation.listName}`}
            onClick={() => respond(false)}
          >
            Decline
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}

export { InvitationItem }
