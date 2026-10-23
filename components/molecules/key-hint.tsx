import { cn } from "cn"

import { Kbd } from "@/components/ui/kbd"

// One or more keys followed by what they do, e.g. "J K move" or, as a range, "1 – 5 switch view".
function KeyHint({
  keys,
  label,
  range = false,
  className,
}: {
  keys: string[]
  label: string
  range?: boolean
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {keys.map((key, index) => (
        <span key={key} className="inline-flex items-center gap-1">
          {range && index > 0 && <span aria-hidden>–</span>}
          <Kbd className="border bg-background">{key}</Kbd>
        </span>
      ))}
      <span className="ml-1">{label}</span>
    </span>
  )
}

export { KeyHint }
