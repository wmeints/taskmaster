import { fireEvent, render, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useShortcuts } from "./use-shortcuts"

function press(key: string, options: KeyboardEventInit = {}, target: Element | Document = document.body) {
  fireEvent.keyDown(target, { key, bubbles: true, ...options })
}

describe("useShortcuts", () => {
  it("calls the handler bound to a key", () => {
    const complete = vi.fn()
    renderHook(() => useShortcuts({ x: complete }))

    press("x")

    expect(complete).toHaveBeenCalledOnce()
  })

  it("matches letters regardless of case", () => {
    const complete = vi.fn()
    renderHook(() => useShortcuts({ x: complete }))

    press("X", { shiftKey: true })

    expect(complete).toHaveBeenCalledOnce()
  })

  it("prevents the browser default for handled keys", () => {
    renderHook(() => useShortcuts({ "/": () => {} }))
    const event = new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true })

    document.body.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it("ignores keys typed into form fields", () => {
    const complete = vi.fn()
    renderHook(() => useShortcuts({ x: complete }))
    const { getByRole } = render(<input aria-label="Title" />)

    press("x", {}, getByRole("textbox"))

    expect(complete).not.toHaveBeenCalled()
  })

  it("ignores keys pressed inside a dialog", () => {
    const complete = vi.fn()
    renderHook(() => useShortcuts({ x: complete }))
    const { getByRole } = render(<div role="dialog"><button>Close</button></div>)

    press("x", {}, getByRole("button"))

    expect(complete).not.toHaveBeenCalled()
  })

  it("ignores keys combined with a modifier unless bound with mod", () => {
    const complete = vi.fn()
    const search = vi.fn()
    renderHook(() => useShortcuts({ x: complete, "mod+k": search }))

    press("x", { ctrlKey: true })
    press("k", { metaKey: true })
    press("k", { ctrlKey: true })

    expect(complete).not.toHaveBeenCalled()
    expect(search).toHaveBeenCalledTimes(2)
  })

  it("fires mod shortcuts even from form fields", () => {
    const search = vi.fn()
    renderHook(() => useShortcuts({ "mod+k": search }))
    const { getByRole } = render(<input aria-label="Title" />)

    press("k", { metaKey: true }, getByRole("textbox"))

    expect(search).toHaveBeenCalledOnce()
  })

  it("stops listening when unmounted", () => {
    const complete = vi.fn()
    const { unmount } = renderHook(() => useShortcuts({ x: complete }))

    unmount()
    press("x")

    expect(complete).not.toHaveBeenCalled()
  })
})
