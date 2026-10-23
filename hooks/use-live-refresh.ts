"use client"

import { useEffect, useRef } from "react"

// How often to refresh while the tab is visible, so changes from people a list is shared with show up.
const interval = 30_000
// Focus and visibility often fire together; refresh once for both.
const minimumGap = 5_000

// Calls refresh when the user comes back to the tab or window, and periodically while the tab is visible.
export function useLiveRefresh(refresh: () => void) {
  const latest = useRef(refresh)
  useEffect(() => {
    latest.current = refresh
  })

  useEffect(() => {
    let last = Date.now()

    function refreshIfStale() {
      if (document.visibilityState !== "visible" || Date.now() - last < minimumGap) return
      last = Date.now()
      latest.current()
    }

    const timer = setInterval(refreshIfStale, interval)
    window.addEventListener("focus", refreshIfStale)
    document.addEventListener("visibilitychange", refreshIfStale)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", refreshIfStale)
      document.removeEventListener("visibilitychange", refreshIfStale)
    }
  }, [])
}
