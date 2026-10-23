import { ShortcutTile } from "@/components/molecules/shortcut-tile"

const shortcuts = [
  { keys: "N", action: "New task" },
  { keys: "Q", action: "Drop in Inbox" },
  { keys: "X", action: "Complete" },
  { keys: "D", action: "Set deadline" },
  { keys: "S", action: "Add subtask" },
  { keys: "H", action: "Hide completed" },
  { keys: "J", action: "Next task" },
  { keys: "⌘K", action: "Command palette" },
]

function KeyboardSection() {
  return (
    // The dark class switches the theme tokens so this band always renders dark.
    <section id="keyboard" className="dark scroll-mt-4 bg-background text-foreground">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your hands never leave the keyboard.
          </h2>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            Every action has a shortcut, and the command palette does the rest. Type “call dentist
            tomorrow #home” and it lands in the right list with the right deadline.
          </p>
          <p className="max-w-md text-sm leading-relaxed">
            On your phone, the same app adapts to touch: big targets, swipe to delete and a
            quick-add sheet.
          </p>
        </div>
        <ul aria-label="Keyboard shortcuts" className="grid gap-2 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <ShortcutTile key={shortcut.keys} {...shortcut} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export { KeyboardSection }
