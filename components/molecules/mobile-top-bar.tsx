"use client"

import { MenuIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

// The bar above a view on small screens: the menu with every view and list, and search.
function MobileTopBar({ onOpenMenu, onSearch }: { onOpenMenu: () => void; onSearch: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 pt-2">
      <Button variant="ghost" size="icon-lg" aria-label="Open menu" onClick={onOpenMenu}>
        <MenuIcon className="size-5" />
      </Button>
      <Button variant="ghost" size="icon-lg" aria-label="Search" onClick={onSearch}>
        <SearchIcon className="size-5" />
      </Button>
    </div>
  )
}

export { MobileTopBar }
