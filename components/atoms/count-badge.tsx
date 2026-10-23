import { cn } from "cn"

function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums",
        className
      )}
    >
      {count}
    </span>
  )
}

export { CountBadge }
