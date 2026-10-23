"use client"

import { KeyHint } from "@/components/molecules/key-hint"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const groups: { title: string; shortcuts: { keys: string[]; label: string; range?: boolean }[] }[] = [
  {
    title: "Tasks",
    shortcuts: [
      { keys: ["N"], label: "New task" },
      { keys: ["J", "K"], label: "Move down and up" },
      { keys: ["↵"], label: "Open task" },
      { keys: ["X"], label: "Mark complete" },
      { keys: ["D"], label: "Set deadline" },
      { keys: ["S"], label: "Add subtask" },
      { keys: ["⌫"], label: "Delete task" },
      { keys: ["Esc"], label: "Close task" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["1", "5"], label: "Switch view", range: true },
      { keys: ["H"], label: "Hide or show completed" },
      { keys: ["⌘", "K"], label: "Search or run a command" },
      { keys: ["?"], label: "Show this list" },
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Everything in Taskmaster works without a mouse.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map((group) => (
            <section key={group.title} className="flex flex-col gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">{group.title}</h3>
              <ul className="flex flex-col gap-2">
                {group.shortcuts.map((shortcut) => (
                  <li key={shortcut.label}>
                    <KeyHint {...shortcut} className="text-sm text-foreground" />
                  </li>
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
