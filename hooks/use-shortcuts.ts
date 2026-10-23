"use client"

import { useEffect, useRef } from "react"

// Maps a key (as in KeyboardEvent.key, letters lower case) or "mod+<key>" (⌘ or Ctrl) to a handler.
export type Shortcuts = Record<string, (event: KeyboardEvent) => void>

// Binds single-key shortcuts on the whole page. Plain keys are ignored while the user types in a
// form field or works in a dialog; "mod+" shortcuts work everywhere.
export function useShortcuts(shortcuts: Shortcuts) {
  // Read the latest handlers without re-binding the listener on every render.
  const latest = useRef(shortcuts)
  useEffect(() => {
    latest.current = shortcuts
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const mod = event.metaKey || event.ctrlKey
      if (event.altKey || (mod && !latest.current[`mod+${key}`])) return

      const handler = mod ? latest.current[`mod+${key}`] : latest.current[key]
      if (!handler || (!mod && isBusyElsewhere(event.target))) return

      event.preventDefault()
      handler(event)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])
}

function isBusyElsewhere(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.closest("input, textarea, select, [role=dialog], [role=listbox], [role=menu]") !== null
  )
}
