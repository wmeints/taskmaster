"use client"

import { useState, useTransition } from "react"
import { EllipsisIcon, Trash2Icon } from "lucide-react"
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

// The actions for a list in the sidebar. Deleting asks for confirmation first.
function ListActionsMenu({
  listName,
  onDelete,
  className,
}: {
  listName: string
  onDelete: () => Promise<{ error: string } | void>
  className?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, startDelete] = useTransition()

  function confirm() {
    startDelete(async () => {
      const result = await onDelete()
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
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setError(null)
              setConfirming(true)
            }}
          >
            <Trash2Icon aria-hidden />
            Delete list…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={(open) => !deleting && setConfirming(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{listName}”?</AlertDialogTitle>
            <AlertDialogDescription>Its tasks stay in your views, without a list.</AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={confirm}>
              {deleting ? "Deleting…" : "Delete list"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { ListActionsMenu }
