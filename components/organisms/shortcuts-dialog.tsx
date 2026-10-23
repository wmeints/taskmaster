"use client"

import { useId } from "react"
import { XIcon } from "lucide-react"

import { ShortcutRow } from "@/components/molecules/shortcut-row"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const groups: { title: string; shortcuts: { keys: string[]; label: string }[] }[] = [
  {
    title: "Navigate",
    shortcuts: [
      { keys: ["J"], label: "Next task" },
      { keys: ["K"], label: "Previous task" },
      { keys: ["↵"], label: "Open details" },
      { keys: ["Esc"], label: "Close or go back" },
      { keys: ["1"], label: "Inbox" },
      { keys: ["2"], label: "Today" },
      { keys: ["3"], label: "Tomorrow" },
      { keys: ["4"], label: "End of week" },
      { keys: ["5"], label: "Later" },
    ],
  },
  {
    title: "Tasks",
    shortcuts: [
      { keys: ["N"], label: "New task here" },
      { keys: ["X"], label: "Complete or reopen" },
      { keys: ["D"], label: "Set deadline" },
      { keys: ["S"], label: "Add subtask" },
      { keys: ["⌫"], label: "Delete" },
    ],
  },
  {
    title: "Lists and views",
    shortcuts: [
      { keys: ["H"], label: "Hide or show completed" },
      { keys: ["⌘", "K"], label: "Command palette" },
      { keys: ["?"], label: "This overview" },
    ],
  },
]

function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: React.ComponentProps<typeof Dialog>["onOpenChange"]
}) {
  const id = useId()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto p-7 sm:max-w-[55rem]"
      >
        <div className="flex items-start justify-between gap-4">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg font-semibold">Keyboard shortcuts</DialogTitle>
            <DialogDescription>Single keys work whenever you are not typing in a field.</DialogDescription>
          </DialogHeader>
          <DialogClose render={<Button variant="outline" size="icon-lg" aria-label="Close" />}>
            <XIcon />
          </DialogClose>
        </div>
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-3">
          {groups.map((group, index) => (
            <section key={group.title} aria-labelledby={`${id}-${index}`} className="flex flex-col gap-2">
              <h3 id={`${id}-${index}`} className="text-sm font-semibold text-foreground/80">
                {group.title}
              </h3>
              <ul className="flex flex-col">
                {group.shortcuts.map((shortcut) => (
                  <ShortcutRow key={shortcut.label} {...shortcut} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ShortcutsDialog }
