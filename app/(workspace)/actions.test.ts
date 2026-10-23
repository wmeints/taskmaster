import { beforeEach, describe, expect, it, vi } from "vitest"

const { accounts, tasks, refresh, redirect } = vi.hoisted(() => ({
  accounts: { getCurrentUser: vi.fn() },
  tasks: {
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    addSubtask: vi.fn(),
    updateSubtask: vi.fn(),
    deleteSubtask: vi.fn(),
    createList: vi.fn(),
    deleteList: vi.fn(),
  },
  refresh: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("@/lib/accounts", () => accounts)
vi.mock("@/lib/tasks", () => tasks)
vi.mock("next/cache", () => ({ refresh }))
vi.mock("next/navigation", () => ({ redirect }))
vi.mock("./today", () => ({ getToday: async () => "2026-10-21" }))

import {
  addSubtaskAction,
  createListAction,
  createTaskAction,
  deleteListAction,
  deleteSubtaskAction,
  deleteTaskAction,
  updateSubtaskAction,
  updateTaskAction,
} from "./actions"

const taskId = "33333333-3333-4333-8333-333333333333"
const subtaskId = "44444444-4444-4444-8444-444444444444"

beforeEach(() => {
  vi.clearAllMocks()
  accounts.getCurrentUser.mockResolvedValue({ id: "user-1", name: "Ada" })
})

describe("createTaskAction", () => {
  it("creates the task in the current scope and refreshes the screen", async () => {
    tasks.createTask.mockResolvedValue(taskId)

    const result = await createTaskAction({ view: "today" }, { title: " Buy paint " })

    expect(result).toEqual({ id: taskId })
    expect(tasks.createTask).toHaveBeenCalledWith("user-1", {
      title: "Buy paint",
      scope: { view: "today" },
      today: "2026-10-21",
    })
    expect(refresh).toHaveBeenCalled()
  })

  it("rejects invalid input", async () => {
    await expect(createTaskAction({ view: "today" }, { title: "" })).resolves.toEqual({ error: "Enter a task" })
    await expect(createTaskAction({ view: "someday" } as never, { title: "Buy paint" })).resolves.toEqual({
      error: "Invalid request",
    })
    expect(tasks.createTask).not.toHaveBeenCalled()
  })

  it("refuses when nobody is signed in", async () => {
    accounts.getCurrentUser.mockResolvedValue(null)

    await expect(createTaskAction({ view: "today" }, { title: "Buy paint" })).rejects.toThrow("Unauthorized")
    expect(tasks.createTask).not.toHaveBeenCalled()
  })
})

describe("updateTaskAction", () => {
  it("applies the validated changes", async () => {
    await updateTaskAction(taskId, { completed: true, due: { date: "2026-10-22", time: null } })

    expect(tasks.updateTask).toHaveBeenCalledWith("user-1", taskId, {
      completed: true,
      due: { date: "2026-10-22", time: null },
    })
    expect(refresh).toHaveBeenCalled()
  })

  it("rejects invalid changes and malformed ids", async () => {
    await expect(updateTaskAction(taskId, { title: "  " })).resolves.toEqual({ error: "Enter a title" })
    await expect(updateTaskAction("nope", { completed: true })).resolves.toEqual({ error: "Invalid request" })
    expect(tasks.updateTask).not.toHaveBeenCalled()
  })
})

describe("deleteTaskAction", () => {
  it("deletes the task", async () => {
    await deleteTaskAction(taskId)

    expect(tasks.deleteTask).toHaveBeenCalledWith("user-1", taskId)
    expect(refresh).toHaveBeenCalled()
  })
})

describe("subtask actions", () => {
  it("adds a subtask", async () => {
    await addSubtaskAction(taskId, { title: "Leave review comments" })

    expect(tasks.addSubtask).toHaveBeenCalledWith("user-1", taskId, "Leave review comments")
  })

  it("rejects an empty subtask", async () => {
    await expect(addSubtaskAction(taskId, { title: "" })).resolves.toEqual({ error: "Enter a subtask" })
  })

  it("checks off and deletes subtasks", async () => {
    await updateSubtaskAction(subtaskId, { done: true })
    await deleteSubtaskAction(subtaskId)

    expect(tasks.updateSubtask).toHaveBeenCalledWith("user-1", subtaskId, { done: true })
    expect(tasks.deleteSubtask).toHaveBeenCalledWith("user-1", subtaskId)
  })
})

describe("createListAction", () => {
  it("creates the list", async () => {
    tasks.createList.mockResolvedValue("list-1")

    await expect(createListAction({ name: "Reading" })).resolves.toEqual({ id: "list-1" })
    expect(tasks.createList).toHaveBeenCalledWith("user-1", "Reading")
  })

  it("requires a name", async () => {
    await expect(createListAction({ name: "" })).resolves.toEqual({ error: "Enter a list name" })
  })
})

describe("deleteListAction", () => {
  const listId = "22222222-2222-4222-8222-222222222222"

  it("deletes the list and refreshes the screen", async () => {
    await expect(deleteListAction(listId, { leave: false })).resolves.toBeUndefined()

    expect(tasks.deleteList).toHaveBeenCalledWith("user-1", listId)
    expect(refresh).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("moves to the inbox when the user was looking at the list", async () => {
    await deleteListAction(listId, { leave: true })

    expect(tasks.deleteList).toHaveBeenCalledWith("user-1", listId)
    expect(redirect).toHaveBeenCalledWith("/inbox")
  })

  it("rejects a malformed id", async () => {
    await expect(deleteListAction("nope", { leave: false })).resolves.toEqual({ error: "Invalid request" })
    expect(tasks.deleteList).not.toHaveBeenCalled()
  })
})
