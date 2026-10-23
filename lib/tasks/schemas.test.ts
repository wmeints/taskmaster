import { describe, expect, it } from "vitest"

import { listSchema, newTaskSchema, quickAddSchema, scopeSchema, subtaskSchema, taskChangesSchema, taskDetailsSchema } from "./schemas"

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? []
}

describe("newTaskSchema", () => {
  it("trims the title", () => {
    expect(newTaskSchema.parse({ title: "  Call the plumber " })).toEqual({ title: "Call the plumber" })
  })

  it("requires a title", () => {
    expect(messages(newTaskSchema.safeParse({ title: "   " }))).toEqual(["Enter a task"])
  })

  it("limits the title length", () => {
    expect(messages(newTaskSchema.safeParse({ title: "x".repeat(501) }))).toEqual([
      "Keep it under 500 characters",
    ])
  })
})

describe("taskDetailsSchema", () => {
  it("accepts a title with an empty description", () => {
    expect(taskDetailsSchema.parse({ title: "Draft release notes", description: "  " })).toEqual({
      title: "Draft release notes",
      description: "",
    })
  })

  it("requires a title", () => {
    expect(messages(taskDetailsSchema.safeParse({ title: "", description: "" }))).toEqual(["Enter a title"])
  })
})

describe("subtaskSchema", () => {
  it("requires a title", () => {
    expect(messages(subtaskSchema.safeParse({ title: "" }))).toEqual(["Enter a subtask"])
  })
})

describe("listSchema", () => {
  it("requires a name", () => {
    expect(messages(listSchema.safeParse({ name: " " }))).toEqual(["Enter a list name"])
  })
})

describe("taskChangesSchema", () => {
  it("accepts a partial set of changes", () => {
    expect(taskChangesSchema.parse({ completed: true })).toEqual({ completed: true })
  })

  it("accepts a deadline with and without a time", () => {
    expect(taskChangesSchema.safeParse({ due: { date: "2026-10-21", time: "14:00" } }).success).toBe(true)
    expect(taskChangesSchema.safeParse({ due: { date: "2026-10-21", time: null } }).success).toBe(true)
    expect(taskChangesSchema.safeParse({ due: null }).success).toBe(true)
  })

  it("rejects malformed deadlines", () => {
    expect(taskChangesSchema.safeParse({ due: { date: "21-10-2026", time: null } }).success).toBe(false)
    expect(taskChangesSchema.safeParse({ due: { date: "2026-10-21", time: "25:00" } }).success).toBe(false)
  })

  it("accepts a list id or no list", () => {
    expect(taskChangesSchema.safeParse({ listId: "3f2b8c1e-8d7a-4c3b-9e2f-1a2b3c4d5e6f" }).success).toBe(true)
    expect(taskChangesSchema.safeParse({ listId: null }).success).toBe(true)
    expect(taskChangesSchema.safeParse({ listId: "not-a-uuid" }).success).toBe(false)
  })

  it("drops unknown fields", () => {
    expect(taskChangesSchema.parse({ completed: false, userId: "someone-else" })).toEqual({ completed: false })
  })
})

describe("scopeSchema", () => {
  it("accepts a view or a list", () => {
    expect(scopeSchema.parse({ view: "end-of-week" })).toEqual({ view: "end-of-week" })
    expect(scopeSchema.safeParse({ listId: "3f2b8c1e-8d7a-4c3b-9e2f-1a2b3c4d5e6f" }).success).toBe(true)
  })

  it("rejects unknown views and malformed list ids", () => {
    expect(scopeSchema.safeParse({ view: "someday" }).success).toBe(false)
    expect(scopeSchema.safeParse({ listId: "nope" }).success).toBe(false)
  })
})

describe("quickAddSchema", () => {
  it("takes a title with an optional deadline and list", () => {
    expect(
      quickAddSchema.parse({ title: " Call the dentist ", due: { date: "2026-10-22", time: "15:00" }, listId: null }),
    ).toEqual({ title: "Call the dentist", due: { date: "2026-10-22", time: "15:00" }, listId: null })
  })

  it("requires a title and valid ids and dates", () => {
    expect(messages(quickAddSchema.safeParse({ title: " ", due: null, listId: null }))).toEqual(["Enter a task"])
    expect(quickAddSchema.safeParse({ title: "Buy paint", due: null, listId: "home" }).success).toBe(false)
    expect(quickAddSchema.safeParse({ title: "Buy paint", due: { date: "fri", time: null }, listId: null }).success).toBe(
      false,
    )
  })
})
