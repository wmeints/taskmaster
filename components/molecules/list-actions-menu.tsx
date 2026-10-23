"use client"

import { useState, useTransition } from "react"
import { EllipsisIcon, LogOutIcon, Trash2Icon, UserPlusIcon } from "lucide-react"
import { cn } from "cn"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Result = Promise<{ error: string } | void>

// What each action that asks for confirmation first says.
const confirmations = {
  delete: {
    title: "Delete",
    description: "Its tasks stay in your views, without a list.",
    action: "Delete list",
    busy: "Deleting…",
  },
  leave: {
    title: "Leave",
    description: "You'll need a new invite to see its tasks again.",
    action: "Leave list",
    busy: "Leaving…",
  },
}

// The actions for a list in the sidebar: the owner can share and delete it, people it was shared with can
// leave it. Only the actions given show; deleting and leaving ask for confirmation first.
function ListActionsMenu({
  listName,
  onShare,
  onDelete,
  onLeave,
  className,
}: {
  listName: string
  onShare?: () => void
  onDelete?: () => Result
  onLeave?: () => Result
  className?: string
}) {
  // The action to confirm; it outlives confirming so the dialog keeps its text while it closes.
  const [pending, setPending] = useState<keyof typeof confirmations>("delete")
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [running, startAction] = useTransition()
  const confirmation = confirmations[pending]

  function ask(action: keyof typeof confirmations) {
    setError(null)
    setPending(action)
    setConfirming(true)
  }

  function confirm() {
    const action = pending === "leave" ? onLeave : onDelete
    if (!action) return
    startAction(async () => {
      const result = await action()
      if (result && "error" in result) {
        setError(result.error)
        return
      }
      setConfirming(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${listName}`}
          className={cn(
            "flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-foreground/10",
            className
          )}
        >
          <EllipsisIcon aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {onShare && (
            <DropdownMenuItem onClick={onShare}>
              <UserPlusIcon aria-hidden />
              Share list…
            </DropdownMenuItem>
          )}
          {onLeave && (
            <DropdownMenuItem variant="destructive" onClick={() => ask("leave")}>
              <LogOutIcon aria-hidden />
              Leave list…
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem variant="destructive" onClick={() => ask("delete")}>
              <Trash2Icon aria-hidden />
              Delete list…
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={(open) => !running && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmation.title} “{listName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmation.description}</AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={running}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={running} onClick={confirm}>
              {running ? confirmation.busy : confirmation.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { ListActionsMenu }
