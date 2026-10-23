"use client"

import { SearchIcon } from "lucide-react"

import { Kbd } from "@/components/ui/kbd"

// Looks like a search field; opens the command menu.
function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-keyshortcuts="Meta+K Control+K"
      className="flex h-9 w-full items-center gap-2 rounded-lg border bg-background px-2.5 text-left text-sm text-muted-foreground outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <SearchIcon aria-hidden className="size-4 shrink-0" />
      <span className="flex-1 truncate">Search or command…</span>
      <Kbd aria-hidden className="border bg-background">
        ⌘K
      </Kbd>
    </button>
  )
}

export { SearchTrigger }
