import { describe, expect, it } from "vitest"

import { hrefFor, scopeFor } from "./routes"

describe("hrefFor", () => {
  it("links each view to its own route", () => {
    expect(hrefFor({ view: "inbox" })).toBe("/inbox")
    expect(hrefFor({ view: "end-of-week" })).toBe("/end-of-week")
  })

  it("links a list to its route", () => {
    expect(hrefFor({ listId: "abc" })).toBe("/lists/abc")
  })

  it("can open a task", () => {
    expect(hrefFor({ view: "today" }, "task-1")).toBe("/today?task=task-1")
  })
})

describe("scopeFor", () => {
  it("reads the view or list from a route", () => {
    expect(scopeFor("/today")).toEqual({ view: "today" })
    expect(scopeFor("/end-of-week")).toEqual({ view: "end-of-week" })
    expect(scopeFor("/lists/a%20b")).toEqual({ listId: "a b" })
  })

  it("round-trips with hrefFor", () => {
    expect(scopeFor(hrefFor({ listId: "abc" }))).toEqual({ listId: "abc" })
  })

  it("returns null for other routes", () => {
    expect(scopeFor("/")).toBeNull()
    expect(scopeFor("/settings")).toBeNull()
    expect(scopeFor("/lists")).toBeNull()
  })
})
