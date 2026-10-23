"use client"

import { useId, useState, useTransition } from "react"
import { XIcon } from "lucide-react"

import { InviteForm } from "@/components/molecules/invite-form"
import { PersonRow } from "@/components/molecules/person-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import type { Account } from "@/lib/accounts"
import type { ListAccess } from "@/lib/sharing/types"

type Result = Promise<{ error: string } | void>

const removeClassName = "text-destructive hover:text-destructive"

// Who has access to a list the user owns, with a form to invite more people by email.
function ShareListDialog({
  open,
  onOpenChange,
  listName,
  owner,
  access,
  onInvite,
  onResend,
  onRevoke,
  onRemove,
}: {
  open: boolean
  onOpenChange: React.ComponentProps<typeof Dialog>["onOpenChange"]
  listName: string
  // The signed-in user.
  owner: Pick<Account, "name" | "email">
  access: ListAccess
  onInvite: React.ComponentProps<typeof InviteForm>["onInvite"]
  onResend: (inviteId: string) => Result
  onRevoke: (inviteId: string) => Result
  onRemove: (memberId: string) => Result
}) {
  const peopleId = useId()
  const [error, setError] = useState<string | null>(null)
  const [busy, startAction] = useTransition()

  function run(action: () => Result) {
    setError(null)
    startAction(async () => {
      const result = await action()
      if (result && "error" in result) setError(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] gap-6 overflow-y-auto p-6 sm:max-w-[30rem]">
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg leading-snug font-semibold">Share “{listName}”</DialogTitle>
            <DialogDescription>
              People you invite can add, edit, complete and delete tasks in this list.
            </DialogDescription>
          </DialogHeader>
          <DialogClose render={<Button variant="outline" size="icon-lg" aria-label="Close" />}>
            <XIcon />
          </DialogClose>
        </div>

        <InviteForm onInvite={onInvite} />

        <section className="flex flex-col gap-3">
          <h3 id={peopleId} className="text-sm font-semibold">
            People with access
          </h3>
          <ul aria-labelledby={peopleId} className="flex flex-col gap-4">
            <PersonRow name="You" detail={owner.email} avatar="self" initials={owner.name.trim().charAt(0).toUpperCase() || "?"}>
              <Badge variant="outline" className="h-6 px-2.5">
                Owner
              </Badge>
            </PersonRow>
            {access.members.map((member) => (
              <PersonRow key={member.id} name={member.name} detail={member.email}>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={busy}
                  aria-label={`Remove ${member.name}`}
                  className={removeClassName}
                  onClick={() => run(() => onRemove(member.id))}
                >
                  Remove
                </Button>
              </PersonRow>
            ))}
            {access.invites.map((invite) => (
              <PersonRow
                key={invite.id}
                name={invite.email}
                detail={invite.declined ? "Declined the invite" : "Invite sent · waiting for reply"}
                avatar="invite"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  disabled={busy}
                  aria-label={`Resend the invite to ${invite.email}`}
                  onClick={() => run(() => onResend(invite.id))}
                >
                  Resend
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={busy}
                  aria-label={`Revoke the invite to ${invite.email}`}
                  className={removeClassName}
                  onClick={() => run(() => onRevoke(invite.id))}
                >
                  Revoke
                </Button>
              </PersonRow>
            ))}
          </ul>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground max-md:hidden">
              Open this dialog with
              <Kbd className="border bg-background">⇧</Kbd>
              <Kbd className="border bg-background">S</Kbd>
            </p>
            <DialogClose render={<Button variant="outline" size="lg" className="h-10 px-4 max-md:w-full" />}>Done</DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ShareListDialog }
