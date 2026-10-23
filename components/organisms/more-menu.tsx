"use client"

import { useTransition } from "react"
import { KeyboardIcon, LogOutIcon, SearchIcon, type LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Account } from "@/lib/accounts"

// Everything that doesn't fit in the tab bar on small screens: search, the shortcuts and the account.
function MoreMenu({
  account,
  signOutAction,
  onSearch,
  onShowShortcuts,
}: {
  account: Pick<Account, "name" | "email" | "createdAt">
  signOutAction: () => Promise<void>
  onSearch: () => void
  onShowShortcuts: () => void
}) {
  const [signingOut, startSignOut] = useTransition()
  const initial = account.name.trim().charAt(0).toUpperCase() || "?"

  function item(label: string, Icon: LucideIcon, onClick: () => void, disabled = false) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex h-11 items-center gap-3 rounded-lg px-2.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <Icon aria-hidden className="size-4 text-muted-foreground" />
        {label}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 px-2.5 py-1.5">
        <Avatar>
          <AvatarFallback className="bg-foreground font-semibold text-background">{initial}</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{account.name}</span>
          <span className="truncate text-xs text-muted-foreground">{account.email}</span>
        </span>
      </div>
      <Separator />
      <div className="flex flex-col">
        {item("Search", SearchIcon, onSearch)}
        {item("Keyboard shortcuts", KeyboardIcon, onShowShortcuts)}
        {item("Sign out", LogOutIcon, () => startSignOut(() => signOutAction()), signingOut)}
      </div>
    </div>
  )
}

export { MoreMenu }
