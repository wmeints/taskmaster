import { describe, expect, it } from "vitest"

import { applyChange, isPending } from "./optimistic"
import type { Task, Workspace } from "./types"

const today = "2026-10-21"
const website = { id: "list-1", name: "Website relaunch", color: "blue" as const }
const home = { id: "list-2", name: "Home renovation", color: "orange" as const }

function task(overrides: Partial<Task>): Task {
  return {
    id: "task",
    title: "Task",
    description: "",
    due: { date: today, time: null },
    list: null,
    completed: false,
    subtasks: [],
    ...overrides,
  }
}

const review = task({
  id: "review",
  title: "Review pull request",
  list: website,
  subtasks: [{ id: "sub-1", title: "Run the branch locally", done: false }],
})
const plumber = task({ id: "plumber", title: "Call the plumber", list: home })
const bill = task({ id: "bill", title: "Pay the electricity bill", completed: true })

const workspace: Workspace = {
  title: "Today",
  scope: { view: "today" },
  today,
  counts: { inbox: 0, today: 2, tomorrow: 0, "end-of-week": 0, later: 0 },
  lists: [
    { ...website, owned: true, openCount: 1 },
    { ...home, owned: true, openCount: 1 },
  ],
  todo: [review, plumber],
  completed: [bill],
  searchable: [],
}

describe("applyChange", () => {
  it("moves a completed task to the completed section and updates the counts", () => {
    const next = applyChange(workspace, { type: "update", taskId: "review", changes: { completed: true } })

    expect(next.todo.map((t) => t.id)).toEqual(["plumber"])
    expect(next.completed.map((t) => t.id)).toEqual(["review", "bill"])
    expect(next.completed[0].completed).toBe(true)
    expect(next.counts.today).toBe(1)
    expect(next.lists[0].openCount).toBe(0)
  })

  it("moves a reopened task back to the to do section", () => {
    const next = applyChange(workspace, { type: "update", taskId: "bill", changes: { completed: false } })

    expect(next.todo.map((t) => t.id)).toEqual(["review", "plumber", "bill"])
    expect(next.completed).toEqual([])
    expect(next.counts.today).toBe(3)
  })

  it("updates fields in place", () => {
    const next = applyChange(workspace, {
      type: "update",
      taskId: "plumber",
      changes: { title: "Call the plumber again", due: { date: "2026-10-22", time: "09:00" }, listId: "list-1" },
    })

    expect(next.todo[1]).toMatchObject({
      title: "Call the plumber again",
      due: { date: "2026-10-22", time: "09:00" },
      list: website,
    })
  })

  it("removes a task from a list", () => {
    const next = applyChange(workspace, { type: "update", taskId: "plumber", changes: { listId: null } })

    expect(next.todo[1].list).toBeNull()
  })

  it("deletes a task and updates the counts", () => {
    const next = applyChange(workspace, { type: "delete", taskId: "review" })

    expect(next.todo.map((t) => t.id)).toEqual(["plumber"])
    expect(next.counts.today).toBe(1)
    expect(next.lists[0].openCount).toBe(0)
  })

  it("adds, checks off and deletes subtasks", () => {
    let next = applyChange(workspace, { type: "add-subtask", taskId: "review", title: "Leave review comments" })
    expect(next.todo[0].subtasks.map((s) => s.title)).toEqual(["Run the branch locally", "Leave review comments"])

    next = applyChange(next, { type: "update-subtask", subtaskId: "sub-1", done: true })
    expect(next.todo[0].subtasks[0].done).toBe(true)

    next = applyChange(next, { type: "delete-subtask", subtaskId: "sub-1" })
    expect(next.todo[0].subtasks.map((s) => s.title)).toEqual(["Leave review comments"])
  })

  it("marks a subtask added optimistically as pending until the server saves it", () => {
    const next = applyChange(workspace, { type: "add-subtask", taskId: "review", title: "Leave review comments" })
    const [saved, added] = next.todo[0].subtasks

    expect(isPending(saved)).toBe(false)
    expect(isPending(added)).toBe(true)
  })

  it("leaves the workspace untouched for an unknown task", () => {
    expect(applyChange(workspace, { type: "delete", taskId: "nope" })).toEqual(workspace)
  })
})
