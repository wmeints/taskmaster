import { describe, expect, it } from "vitest"

import { headingFor } from "./headings"

const today = "2026-10-21"
const lists = [
  { id: "list-1", name: "Website relaunch", color: "blue" as const, owned: true, openCount: 4 },
  { id: "list-2", name: "Reading", color: "emerald" as const, owned: true, openCount: 1 },
]

describe("headingFor", () => {
  it("titles a view and dates today and tomorrow", () => {
    expect(headingFor({ view: "today" }, { lists, today })).toEqual({ title: "Today", subtitle: "Wednesday 21 October" })
    expect(headingFor({ view: "tomorrow" }, { lists, today })).toEqual({
      title: "Tomorrow",
      subtitle: "Thursday 22 October",
    })
    expect(headingFor({ view: "inbox" }, { lists, today })).toEqual({ title: "Inbox" })
  })

  it("titles a list with its number of open tasks", () => {
    expect(headingFor({ listId: "list-1" }, { lists, today })).toEqual({
      title: "Website relaunch",
      subtitle: "4 open tasks",
    })
    expect(headingFor({ listId: "list-2" }, { lists, today })).toEqual({ title: "Reading", subtitle: "1 open task" })
  })

  it("returns null for a list it doesn't know", () => {
    expect(headingFor({ listId: "list-3" }, { lists, today })).toBeNull()
  })
})
