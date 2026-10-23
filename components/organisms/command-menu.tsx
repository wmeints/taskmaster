"use client"

import { useState, useTransition } from "react"
import { AlignLeftIcon, CheckIcon, InboxIcon, KeyboardIcon, PlusIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"

import { HighlightedText } from "@/components/atoms/highlighted-text"
import { ListDot } from "@/components/atoms/list-dot"
import { RecognisedBar } from "@/components/molecules/recognised-bar"
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
import { Kbd } from "@/components/ui/kbd"
import { describeDue, viewOf } from "@/lib/tasks/deadlines"
import { parseQuickAdd } from "@/lib/tasks/quick-add"
import { hrefFor } from "@/lib/tasks/routes"
import type { QuickAddValues } from "@/lib/tasks/schemas"
import { searchTasks } from "@/lib/tasks/search"
import { viewTitles, type List, type Overview, type View } from "@/lib/tasks/types"

type AddMode = "add" | "open" | "inbox"

// ⌘K: add a task from one line of text ("Call the dentist tomorrow #home"), jump to a task, view or list,
// or run a command. Starting with ">" shows only views, lists and commands.
function CommandMenu({
  open,
  onOpenChange,
  lists,
  searchable,
  today,
  onNavigate,
  onShowShortcuts,
  onAddTask,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lists: List[]
  searchable: Overview["searchable"]
  today: string
  onNavigate: (href: string) => void
  onShowShortcuts: () => void
  onAddTask: (values: QuickAddValues) => Promise<{ id: string } | { error: string }>
}) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [adding, startAdding] = useTransition()

  const text = query.trim()
  const commandsOnly = text.startsWith(">")
  const filter = (commandsOnly ? text.slice(1) : text).trim().toLowerCase()
  const parsed = text && !commandsOnly ? parseQuickAdd(text, { lists, today }) : null
  const matches = parsed ? searchTasks(parsed.title || text, searchable, { limit: 6 }) : []
  const views = (Object.keys(viewTitles) as View[]).filter((view) => viewTitles[view].toLowerCase().includes(filter))
  const shownLists = lists.filter((list) => list.name.toLowerCase().includes(filter))
  const commands = [{ label: "Keyboard shortcuts", key: "?", icon: KeyboardIcon, run: onShowShortcuts }].filter(
    (command) => command.label.toLowerCase().includes(filter),
  )

  function changeOpen(next: boolean) {
    if (!next) {
      setQuery("")
      setError(null)
    }
    onOpenChange(next)
  }

  function run(action: () => void) {
    changeOpen(false)
    action()
  }

  function add(mode: AddMode) {
    if (!parsed || adding) return
    const values: QuickAddValues =
      mode === "inbox"
        ? { title: text, due: null, listId: null }
        : { title: parsed.title, due: parsed.due, listId: parsed.list?.id ?? null }
    if (!values.title) return

    startAdding(async () => {
      const result = await onAddTask(values)
      if ("error" in result) {
        setError(result.error)
        return
      }
      changeOpen(false)
      if (mode === "open") {
        const scope = values.listId ? { listId: values.listId } : { view: viewOf(values.due?.date ?? null, today) }
        onNavigate(hrefFor(scope, result.id))
      }
    })
  }

  return (
    <CommandDialog open={open} onOpenChange={changeOpen} title="Search or command" className="top-[10dvh] sm:max-w-[37.5rem]">
      <Command label="Search or command" shouldFilter={false} className="p-0">
        <CommandInput
          size="lg"
          value={query}
          onValueChange={(value) => {
            setQuery(value)
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !parsed) return
            if (event.metaKey || event.ctrlKey) {
              event.preventDefault()
              add("open")
            } else if (event.shiftKey) {
              event.preventDefault()
              add("inbox")
            }
          }}
          placeholder="Add a task, or search tasks, views and lists…"
          trailing={<Kbd className="border bg-background">Esc</Kbd>}
        />
        {parsed && (
          <RecognisedBar deadline={parsed.due && describeDue(parsed.due, today)} list={parsed.list} />
        )}
        {error && (
          <p role="alert" className="border-b px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <CommandList className="max-h-[min(26rem,60dvh)] p-1.5">
          <CommandEmpty>Nothing found.</CommandEmpty>
          {parsed && (
            <CommandGroup heading="Create">
              {parsed.title && (
                <>
                  <CreateItem value="create-add" icon={PlusIcon} primary keys="↵" onSelect={() => add("add")}>
                    <span className="font-medium">Add “{parsed.title}”</span>
                    {parsed.due && <> <span className="text-muted-foreground">· {describeDue(parsed.due, today)}</span></>}
                    {parsed.list && <> <span className="text-muted-foreground">· {parsed.list.name}</span></>}
                  </CreateItem>
                  <CreateItem value="create-open" icon={AlignLeftIcon} keys="⌘↵" onSelect={() => add("open")}>
                    Add and open details <span className="text-muted-foreground">· description, subtasks</span>
                  </CreateItem>
                </>
              )}
              <CreateItem value="create-inbox" icon={InboxIcon} keys="⇧↵" onSelect={() => add("inbox")}>
                Drop full text in Inbox <span className="text-muted-foreground">· ignore date and list</span>
              </CreateItem>
            </CommandGroup>
          )}
          {matches.length > 0 && (
            <CommandGroup heading="Matching tasks">
              {matches.map(({ task, highlights }) => (
                <CommandItem
                  key={task.id}
                  value={`task-${task.id}`}
                  onSelect={() => run(() => onNavigate(hrefFor({ view: task.view }, task.id)))}
                  className="h-11 gap-3 px-2.5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-foreground/30",
                      task.completed && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {task.completed && <CheckIcon className="size-3! text-primary-foreground!" />}
                  </span>
                  <span className={cn("truncate", task.completed && "text-muted-foreground")}>
                    <HighlightedText text={task.title} ranges={highlights} />{" "}
                    <span className="text-muted-foreground">· {task.completed ? "Completed" : viewTitles[task.view]}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {views.length > 0 && (
            <CommandGroup heading="Views">
              {views.map((view) => (
                <CommandItem key={view} value={`view-${view}`} onSelect={() => run(() => onNavigate(hrefFor({ view })))}>
                  {viewTitles[view]}
                  <CommandShortcut>{(Object.keys(viewTitles) as View[]).indexOf(view) + 1}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {shownLists.length > 0 && (
            <CommandGroup heading="Lists">
              {shownLists.map((list) => (
                <CommandItem
                  key={list.id}
                  value={`list-${list.id}`}
                  onSelect={() => run(() => onNavigate(hrefFor({ listId: list.id })))}
                >
                  <ListDot color={list.color} />
                  {list.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {commands.length > 0 && (
            <CommandGroup heading="Commands">
              {commands.map(({ label, key, icon: Icon, run: action }) => (
                <CommandItem key={label} value={`command-${label}`} onSelect={() => run(action)}>
                  <Icon />
                  {label}
                  <CommandShortcut>{key}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <footer className="flex items-center gap-4 border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground max-sm:hidden">
          <Hint keys={["↑", "↓"]}>navigate</Hint>
          <Hint keys={["↵"]}>select</Hint>
          <Hint keys={[">"]}>commands only</Hint>
          <Hint keys={["Esc"]} className="ml-auto">
            back to app
          </Hint>
        </footer>
      </Command>
    </CommandDialog>
  )
}

// One of the ways to add what the user typed, with the keys that do it from the input.
function CreateItem({
  value,
  icon: Icon,
  primary = false,
  keys,
  onSelect,
  children,
}: {
  value: string
  icon: LucideIcon
  primary?: boolean
  keys: string
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <CommandItem value={value} onSelect={onSelect} className="h-11 gap-3 px-2.5">
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border bg-background",
          primary && "border-primary bg-primary [&_svg]:text-primary-foreground!"
        )}
      >
        <Icon />
      </span>
      <span className="truncate">{children}</span>
      <CommandShortcut className="tracking-normal">
        <Kbd className="border bg-background">{keys}</Kbd>
      </CommandShortcut>
    </CommandItem>
  )
}

function Hint({ keys, className, children }: { keys: string[]; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {keys.map((key) => (
        <Kbd key={key} className="border bg-background">
          {key}
        </Kbd>
      ))}
      <span className="ml-1">{children}</span>
    </span>
  )
}

export { CommandMenu }
