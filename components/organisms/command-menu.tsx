"use client"

import { CircleIcon, KeyboardIcon, PlusIcon } from "lucide-react"

import { ListDot } from "@/components/atoms/list-dot"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { hrefFor } from "@/lib/tasks/routes"
import { viewTitles, type List, type View, type Workspace } from "@/lib/tasks/types"

// ⌘K: jump to any open task, view or list, or run a command.
function CommandMenu({
  open,
  onOpenChange,
  lists,
  searchable,
  onNavigate,
  onNewTask,
  onShowShortcuts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lists: List[]
  searchable: Workspace["searchable"]
  onNavigate: (href: string) => void
  onNewTask: () => void
  onShowShortcuts: () => void
}) {
  function run(action: () => void) {
    onOpenChange(false)
    action()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search or command">
      <Command label="Search or command">
        <CommandInput placeholder="Search tasks, views and lists…" />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandGroup heading="Commands">
            <CommandItem onSelect={() => run(onNewTask)}>
              <PlusIcon />
              New task
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(onShowShortcuts)}>
              <KeyboardIcon />
              Keyboard shortcuts
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Views">
            {(Object.keys(viewTitles) as View[]).map((view, index) => (
              <CommandItem key={view} onSelect={() => run(() => onNavigate(hrefFor({ view })))}>
                {viewTitles[view]}
                <CommandShortcut>{index + 1}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          {lists.length > 0 && (
            <CommandGroup heading="Lists">
              {lists.map((list) => (
                <CommandItem key={list.id} onSelect={() => run(() => onNavigate(hrefFor({ listId: list.id })))}>
                  <ListDot color={list.color} />
                  {list.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {searchable.length > 0 && (
            <CommandGroup heading="Tasks">
              {searchable.map((task) => (
                <CommandItem
                  key={task.id}
                  // cmdk filters on value; include the id so tasks with the same title stay distinct.
                  value={`${task.title} ${task.id}`}
                  onSelect={() => run(() => onNavigate(hrefFor({ view: task.view }, task.id)))}
                >
                  <CircleIcon className="text-muted-foreground" />
                  <span className="truncate">{task.title}</span>
                  <CommandShortcut className="tracking-normal">{viewTitles[task.view]}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

export { CommandMenu }
