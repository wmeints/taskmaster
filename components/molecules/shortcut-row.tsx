import { Kbd, KbdGroup } from "@/components/ui/kbd"

// A shortcut in the shortcuts overview: what it does, and the keys to press.
function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b py-1 text-sm">
      {label}
      <KbdGroup>
        {keys.map((key) => (
          <Kbd key={key} className="h-6 min-w-6 border bg-background px-1.5 text-foreground shadow-xs">
            {key}
          </Kbd>
        ))}
      </KbdGroup>
    </li>
  )
}

export { ShortcutRow }
