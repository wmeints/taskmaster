"use client"

import { useTransition } from "react"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Account } from "@/lib/accounts"

// The signed-in user at the bottom of the sidebar; opens a summary of their account and signs out.
function AccountMenu({
  account,
  signOutAction,
}: {
  account: Pick<Account, "name" | "email" | "createdAt">
  signOutAction: () => Promise<void>
}) {
  const [signingOut, startSignOut] = useTransition()
  const initial = account.name.trim().charAt(0).toUpperCase() || "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left text-sm font-medium outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-sidebar-accent">
        <Avatar size="sm" className="size-7">
          <AvatarFallback className="bg-foreground text-xs font-semibold text-background">{initial}</AvatarFallback>
        </Avatar>
        <span className="flex-1 truncate">{account.name}</span>
        <ChevronsUpDownIcon aria-hidden className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-1.5 py-1.5 text-foreground">
            <Avatar>
              <AvatarFallback className="bg-foreground font-semibold text-background">{initial}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{account.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{account.email}</span>
            </span>
          </DropdownMenuLabel>
          {account.createdAt && (
            <p className="px-1.5 pb-1.5 text-xs text-muted-foreground">
              Member since{" "}
              {account.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signingOut}
          onClick={() => startSignOut(() => signOutAction())}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu }
