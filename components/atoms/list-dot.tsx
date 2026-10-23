import { cn } from "cn"

import type { ListColor } from "@/lib/tasks/types"

const colors: Record<ListColor, string> = {
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
}

// The colored square that identifies a list.
function ListDot({ color, className }: { color: ListColor; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-[2px]", colors[color], className)} />
}

export { ListDot }
