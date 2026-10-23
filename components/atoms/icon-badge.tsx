import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border bg-background text-primary",
        className
      )}
    >
      <Icon aria-hidden className="size-4" />
    </span>
  )
}

export { IconBadge }
