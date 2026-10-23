import { MailIcon } from "lucide-react"
import { cn } from "cn"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// "Mara Kok" → "MK".
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words
  return letters.map((word) => word.charAt(0).toUpperCase()).join("") || "?"
}

// Someone with or offered access to a list: their avatar, name, a detail line and what can be done.
function PersonRow({
  name,
  detail,
  avatar = "member",
  initials = initialsOf(name),
  children,
  className,
}: {
  name: string
  detail: string
  // self: the signed-in user; invite: an email address that hasn't joined yet.
  avatar?: "self" | "member" | "invite"
  initials?: string
  // The actions or badge at the end of the row.
  children?: React.ReactNode
  className?: string
}) {
  return (
    <li className={cn("flex items-center gap-3", className)}>
      {avatar === "invite" ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/60 text-muted-foreground">
          <MailIcon aria-hidden className="size-4" />
        </span>
      ) : (
        <Avatar>
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              avatar === "self" ? "bg-foreground text-background" : "text-foreground"
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{detail}</span>
      </span>
      {children && <span className="flex shrink-0 items-center gap-2">{children}</span>}
    </li>
  )
}

export { PersonRow }
