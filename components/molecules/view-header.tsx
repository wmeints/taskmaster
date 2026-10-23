"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

// The title of a view. On small screens a floating button adds tasks instead of the New task button.
function ViewHeader({ title, subtitle, onNewTask }: { title: string; subtitle?: string; onNewTask: () => void }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-3xl font-bold tracking-tight md:text-2xl md:font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <Button size="lg" onClick={onNewTask} aria-keyshortcuts="N" className="gap-2 px-3 max-md:hidden">
        <PlusIcon data-icon="inline-start" />
        New task
        <Kbd aria-hidden className="border border-primary-foreground/40 bg-transparent text-primary-foreground">N</Kbd>
      </Button>
    </header>
  )
}

export { ViewHeader }
