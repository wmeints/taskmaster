import { beforeEach, describe, expect, it, vi } from "vitest"

const { accounts, tasks, sharing, refresh, redirect } = vi.hoisted(() => ({
  accounts: { getCurrentUser: vi.fn() },
  sharing: {
    inviteToList: vi.fn(),
    resendInvite: vi.fn(),
    revokeInvite: vi.fn(),
    removeMember: vi.fn(),
    respondToInvitation: vi.fn(),
    leaveList: vi.fn(),
  },
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
vi.mock("@/lib/sharing", () => sharing)
vi.mock("next/cache", () => ({ refresh }))
vi.mock("next/navigation", () => ({ redirect }))
vi.mock("./today", () => ({ getToday: async () => "2026-10-21" }))

import {
  addSubtaskAction,
  createListAction,
  createTaskAction,
  quickAddTaskAction,
  deleteListAction,
  deleteSubtaskAction,
  deleteTaskAction,
  inviteToListAction,
  leaveListAction,
  removeMemberAction,
  resendInviteAction,
  respondToInvitationAction,
  revokeInviteAction,
  updateSubtaskAction,
  updateTaskAction,
} from "./actions"

const taskId = "33333333-3333-4333-8333-333333333333"
const subtaskId = "44444444-4444-4444-8444-444444444444"

beforeEach(() => {
  vi.clearAllMocks()
  accounts.getCurrentUser.mockResolvedValue({ id: "user-1", name: "Ada", email: "ada@example.com" })
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

  it("passes on a deadline and list read from the title", async () => {
    const homeId = "22222222-2222-4222-8222-222222222222"
    tasks.createTask.mockResolvedValue(taskId)

    await createTaskAction({ view: "today" }, { title: "Buy paint", due: { date: "2026-10-26", time: null }, listId: homeId })

    expect(tasks.createTask).toHaveBeenCalledWith("user-1", {
      title: "Buy paint",
      due: { date: "2026-10-26", time: null },
      listId: homeId,
      scope: { view: "today" },
      today: "2026-10-21",
    })
  })

  it("passes on a new list to create for the task", async () => {
    tasks.createTask.mockResolvedValue(taskId)

    await createTaskAction({ view: "today" }, { title: "Plan trip", newList: " Summer holiday " })

    expect(tasks.createTask).toHaveBeenCalledWith("user-1", {
      title: "Plan trip",
      newList: "Summer holiday",
      scope: { view: "today" },
      today: "2026-10-21",
    })
  })

  it("rejects invalid input", async () => {
    await expect(createTaskAction({ view: "today" }, { title: "Plan trip", newList: "x".repeat(101) })).resolves.toEqual({
      error: "Keep it under 100 characters",
    })
    await expect(createTaskAction({ view: "today" }, { title: "" })).resolves.toEqual({ error: "Enter a task" })
    await expect(
      createTaskAction({ view: "today" }, { title: "Buy paint", due: { date: "friday", time: null } }),
    ).resolves.toEqual({ error: expect.any(String) })
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

describe("quickAddTaskAction", () => {
  const homeId = "22222222-2222-4222-8222-222222222222"

  it("passes on a new list to create for the task", async () => {
    tasks.createTask.mockResolvedValue(taskId)

    await quickAddTaskAction({ title: "Plan trip", due: null, listId: null, newList: "Summer holiday" })

    expect(tasks.createTask).toHaveBeenCalledWith("user-1", {
      title: "Plan trip",
      due: null,
      listId: null,
      newList: "Summer holiday",
    })
  })

  it("creates the task with the recognised deadline and list", async () => {
    tasks.createTask.mockResolvedValue(taskId)

    const result = await quickAddTaskAction({
      title: " Call the dentist ",
      due: { date: "2026-10-22", time: null },
      listId: homeId,
    })

    expect(result).toEqual({ id: taskId })
    expect(tasks.createTask).toHaveBeenCalledWith("user-1", {
      title: "Call the dentist",
      due: { date: "2026-10-22", time: null },
      listId: homeId,
    })
    expect(refresh).toHaveBeenCalled()
  })

  it("rejects invalid input", async () => {
    await expect(quickAddTaskAction({ title: "", due: null, listId: null })).resolves.toEqual({
      error: "Enter a task",
    })
    await expect(
      quickAddTaskAction({ title: "Buy paint", due: { date: "friday", time: null }, listId: null }),
    ).resolves.toEqual({ error: expect.any(String) })
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

describe("sharing actions", () => {
  const listId = "22222222-2222-4222-8222-222222222222"
  const inviteId = "55555555-5555-4555-8555-555555555555"

  it("invites the addresses entered and refreshes the screen", async () => {
    await expect(inviteToListAction(listId, { emails: "Mara@example.com, joost@example.com" })).resolves.toBeUndefined()

    expect(sharing.inviteToList).toHaveBeenCalledWith("user-1", listId, ["mara@example.com", "joost@example.com"])
    expect(refresh).toHaveBeenCalled()
  })

  it("re-validates the addresses on the server", async () => {
    await expect(inviteToListAction(listId, { emails: "joost" })).resolves.toEqual({
      error: "“joost” isn't a valid email address",
    })
    expect(sharing.inviteToList).not.toHaveBeenCalled()
  })

  it("passes on why nobody was invited", async () => {
    sharing.inviteToList.mockResolvedValue({ error: "Everyone you entered already has access" })

    await expect(inviteToListAction(listId, { emails: "ada@example.com" })).resolves.toEqual({
      error: "Everyone you entered already has access",
    })
  })

  it("resends and revokes invites", async () => {
    await resendInviteAction(inviteId)
    await revokeInviteAction(inviteId)

    expect(sharing.resendInvite).toHaveBeenCalledWith("user-1", inviteId)
    expect(sharing.revokeInvite).toHaveBeenCalledWith("user-1", inviteId)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it("removes a member", async () => {
    await removeMemberAction(listId, "user-2")

    expect(sharing.removeMember).toHaveBeenCalledWith("user-1", listId, "user-2")
  })

  it("answers an invitation as the signed-in user", async () => {
    await respondToInvitationAction(inviteId, { accept: true })

    expect(sharing.respondToInvitation).toHaveBeenCalledWith({ id: "user-1", email: "ada@example.com" }, inviteId, {
      accept: true,
    })
    expect(refresh).toHaveBeenCalled()
  })

  it("leaves a shared list, moving to the inbox when the user was looking at it", async () => {
    await leaveListAction(listId, { leave: true })

    expect(sharing.leaveList).toHaveBeenCalledWith("user-1", listId)
    expect(redirect).toHaveBeenCalledWith("/inbox")
  })

  it("rejects malformed ids", async () => {
    await expect(inviteToListAction("nope", { emails: "mara@example.com" })).resolves.toEqual({ error: "Invalid request" })
    await expect(resendInviteAction("nope")).resolves.toEqual({ error: "Invalid request" })
    await expect(revokeInviteAction("nope")).resolves.toEqual({ error: "Invalid request" })
    await expect(removeMemberAction(listId, "")).resolves.toEqual({ error: "Invalid request" })
    await expect(respondToInvitationAction("nope", { accept: true })).resolves.toEqual({ error: "Invalid request" })
    await expect(leaveListAction("nope", { leave: false })).resolves.toEqual({ error: "Invalid request" })
    for (const action of Object.values(sharing)) expect(action).not.toHaveBeenCalled()
  })
})
