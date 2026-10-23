import { fireEvent, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLiveRefresh } from "./use-live-refresh"

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state })
  fireEvent(document, new Event("visibilitychange"))
}

describe("useLiveRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setVisibility("visible")
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("does not refresh on mount", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    expect(refresh).not.toHaveBeenCalled()
  })

  it("refreshes when the tab becomes visible again", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    setVisibility("hidden")
    vi.advanceTimersByTime(10_000)
    setVisibility("visible")

    expect(refresh).toHaveBeenCalledOnce()
  })

  it("refreshes when the window regains focus", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    vi.advanceTimersByTime(10_000)
    fireEvent.focus(window)

    expect(refresh).toHaveBeenCalledOnce()
  })

  it("refreshes once when focus and visibility arrive together", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    setVisibility("hidden")
    vi.advanceTimersByTime(10_000)
    setVisibility("visible")
    fireEvent.focus(window)

    expect(refresh).toHaveBeenCalledOnce()
  })

  it("refreshes periodically while the tab is visible", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    vi.advanceTimersByTime(60_000)

    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it("does not refresh periodically while the tab is hidden", () => {
    const refresh = vi.fn()
    renderHook(() => useLiveRefresh(refresh))

    setVisibility("hidden")
    vi.advanceTimersByTime(60_000)

    expect(refresh).not.toHaveBeenCalled()
  })

  it("stops listening when unmounted", () => {
    const refresh = vi.fn()
    const { unmount } = renderHook(() => useLiveRefresh(refresh))

    unmount()
    vi.advanceTimersByTime(60_000)
    fireEvent.focus(window)

    expect(refresh).not.toHaveBeenCalled()
  })
})
