import { Kbd } from "@/components/ui/kbd"

function ShortcutTile({ keys, action }: { keys: string; action: string }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm">
      <Kbd className="h-6 min-w-7 border bg-background font-semibold text-foreground">{keys}</Kbd>
      {action}
    </li>
  )
}

export { ShortcutTile }
