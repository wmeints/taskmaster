import { describe, expect, it } from "vitest"

import { hrefFor } from "./routes"

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
