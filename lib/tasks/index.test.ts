import { eq, sql } from "drizzle-orm"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db", () => import("@/lib/db/testing"))

import { db, resetDatabase } from "@/lib/db/testing"
import { listMembers, lists, subtasks, tasks } from "@/lib/db/schema"
import {
  addSubtask,
  createList,
  createTask,
  deleteList,
  deleteSubtask,
  deleteTask,
  getOverview,
  getWorkspace,
  updateSubtask,
  updateTask,
} from "./index"

const userId = "6a0c1c3e-1111-4111-8111-111111111111"
const otherUserId = "6a0c1c3e-2222-4222-8222-222222222222"
const today = "2026-10-21"

async function givenList(name: string, { color = "blue", owner = userId } = {}) {
  const [{ id }] = await db
    .insert(lists)
    .values({ userId: owner, name, color: color as "blue" })
    .returning({ id: lists.id })
  return id
}

async function givenTask(values: Partial<typeof tasks.$inferInsert> = {}) {
  const [{ id }] = await db
    .insert(tasks)
    .values({ userId, title: "Task", ...values })
    .returning({ id: tasks.id })
  return id
}

async function givenSubtask(taskId: string, title: string, done = false) {
  const [{ id }] = await db.insert(subtasks).values({ taskId, title, done }).returning({ id: subtasks.id })
  return id
}

async function givenShared(listId: string, memberId = userId) {
  await db.insert(listMembers).values({ listId, userId: memberId })
}

async function storedTask(taskId: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId))
  return task
}

const titles = (items: { title: string }[] | undefined) => items?.map((item) => item.title)

beforeEach(async () => {
  await resetDatabase()
})

describe("getWorkspace", () => {
  it("shows the open and completed tasks of a view", async () => {
    const websiteId = await givenList("Website relaunch")
    await givenTask({ title: "Review pull request", dueDate: today, dueTime: "14:00", listId: websiteId })
    await givenTask({ title: "Pay the electricity bill", dueDate: today, completedAt: new Date() })
    await givenTask({ title: "Buy paint", dueDate: "2026-10-22" })

    const workspace = await getWorkspace(userId, { view: "today" }, today)

    expect(workspace?.title).toBe("Today")
    expect(titles(workspace?.todo)).toEqual(["Review pull request"])
    expect(titles(workspace?.completed)).toEqual(["Pay the electricity bill"])
    expect(workspace?.todo[0]).toMatchObject({
      due: { date: today, time: "14:00" },
      list: { id: websiteId, name: "Website relaunch", color: "blue" },
      completed: false,
    })
  })

  it("only shows the signed-in user's data", async () => {
    await givenList("Someone else's list", { owner: otherUserId })
    await givenTask({ title: "Someone else's task", userId: otherUserId })
    await givenTask({ title: "Mine" })

    const workspace = await getWorkspace(userId, { view: "inbox" }, today)

    expect(workspace?.lists).toEqual([])
    expect(titles(workspace?.todo)).toEqual(["Mine"])
  })

  it("also shows the lists shared with the user and every task in them", async () => {
    const homeId = await givenList("Home renovation", { color: "orange", owner: otherUserId })
    await givenShared(homeId)
    await givenTask({ title: "Pick a hosting provider", userId: otherUserId, listId: homeId })

    const workspace = await getWorkspace(userId, { listId: homeId }, today)

    expect(workspace?.lists).toEqual([
      { id: homeId, name: "Home renovation", color: "orange", owned: false, openCount: 1 },
    ])
    expect(workspace?.todo[0].list).toEqual({ id: homeId, name: "Home renovation", color: "orange" })
  })

  it("counts open tasks per view and per list", async () => {
    const websiteId = await givenList("Website relaunch")
    const homeId = await givenList("Home renovation", { color: "orange" })
    await givenTask({ dueDate: null })
    await givenTask({ dueDate: "2026-10-01", listId: homeId })
    await givenTask({ dueDate: today, listId: websiteId })
    await givenTask({ dueDate: today, completedAt: new Date(), listId: websiteId })
    await givenTask({ dueDate: "2026-10-22" })
    await givenTask({ dueDate: "2026-10-24", listId: websiteId })
    await givenTask({ dueDate: "2026-12-01" })

    const workspace = await getWorkspace(userId, { view: "today" }, today)

    expect(workspace?.counts).toEqual({ inbox: 1, today: 2, tomorrow: 1, "end-of-week": 1, later: 1 })
    expect(workspace?.lists).toEqual([
      { id: websiteId, name: "Website relaunch", color: "blue", owned: true, openCount: 2 },
      { id: homeId, name: "Home renovation", color: "orange", owned: true, openCount: 1 },
    ])
  })

  it("shows every task of a list regardless of deadline", async () => {
    const websiteId = await givenList("Website relaunch")
    const homeId = await givenList("Home renovation")
    await givenTask({ title: "Draft release notes", dueDate: today, listId: websiteId })
    await givenTask({ title: "Write blog post", dueDate: null, listId: websiteId })
    await givenTask({ title: "Call the plumber", dueDate: today, listId: homeId })

    const workspace = await getWorkspace(userId, { listId: websiteId }, today)

    expect(workspace?.title).toBe("Website relaunch")
    expect(titles(workspace?.todo)).toEqual(["Draft release notes", "Write blog post"])
  })

  it("puts the earliest deadline first and tasks without one last", async () => {
    const websiteId = await givenList("Website relaunch")
    await givenTask({ title: "No deadline", listId: websiteId })
    await givenTask({ title: "Friday", dueDate: "2026-10-23", listId: websiteId })
    await givenTask({ title: "Today, afternoon", dueDate: today, dueTime: "14:00", listId: websiteId })
    await givenTask({ title: "Today, morning", dueDate: today, dueTime: "09:30", listId: websiteId })
    await givenTask({ title: "Today, any time", dueDate: today, listId: websiteId })

    const workspace = await getWorkspace(userId, { listId: websiteId }, today)

    expect(titles(workspace?.todo)).toEqual(["Today, morning", "Today, afternoon", "Today, any time", "Friday", "No deadline"])
  })

  it("returns null for a list the user does not have", async () => {
    const otherListId = await givenList("Someone else's list", { owner: otherUserId })

    await expect(getWorkspace(userId, { listId: otherListId }, today)).resolves.toBeNull()
    await expect(getWorkspace(userId, { listId: crypto.randomUUID() }, today)).resolves.toBeNull()
  })

  it("returns null for a malformed list id", async () => {
    await expect(getWorkspace(userId, { listId: "nope" }, today)).resolves.toBeNull()
  })

  it("lists the open and recently completed tasks of every view for search", async () => {
    const paintId = await givenTask({ title: "Buy paint", dueDate: "2026-10-22" })
    const doneId = await givenTask({ title: "Done already", completedAt: new Date() })
    await givenTask({ title: "Done long ago", completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) })

    const workspace = await getWorkspace(userId, { view: "inbox" }, today)

    expect(workspace?.searchable).toEqual([
      { id: paintId, title: "Buy paint", view: "tomorrow", completed: false },
      { id: doneId, title: "Done already", view: "inbox", completed: true },
    ])
  })

  it("includes subtasks in the order they were added", async () => {
    const taskId = await givenTask()
    const firstId = await givenSubtask(taskId, "Run the branch locally", true)
    const secondId = await givenSubtask(taskId, "Leave review comments")

    const workspace = await getWorkspace(userId, { view: "inbox" }, today)

    expect(workspace?.todo[0].subtasks).toEqual([
      { id: firstId, title: "Run the branch locally", done: true },
      { id: secondId, title: "Leave review comments", done: false },
    ])
  })
})

describe("getOverview", () => {
  it("counts open tasks per view and per list and lists them for search", async () => {
    const websiteId = await givenList("Website relaunch")
    const homeId = await givenList("Home renovation", { color: "orange" })
    const paintId = await givenTask({ title: "Buy paint", dueDate: "2026-10-22", listId: homeId })
    await givenTask({ title: "Done already", dueDate: today, completedAt: new Date(), listId: homeId })

    const overview = await getOverview(userId, today)

    expect(overview).toEqual({
      counts: { inbox: 0, today: 0, tomorrow: 1, "end-of-week": 0, later: 0 },
      lists: [
        { id: websiteId, name: "Website relaunch", color: "blue", owned: true, openCount: 0 },
        { id: homeId, name: "Home renovation", color: "orange", owned: true, openCount: 1 },
      ],
      searchable: [
        { id: paintId, title: "Buy paint", view: "tomorrow", completed: false },
        expect.objectContaining({ title: "Done already", completed: true }),
      ],
    })
  })
})

describe("createTask", () => {
  it("gives a task added to a view that view's deadline", async () => {
    const taskId = await createTask(userId, { title: "Buy paint", scope: { view: "tomorrow" }, today })

    expect(await storedTask(taskId)).toMatchObject({
      userId,
      title: "Buy paint",
      dueDate: "2026-10-22",
      dueTime: null,
      listId: null,
    })
  })

  it("leaves tasks added to the inbox without a deadline", async () => {
    const taskId = await createTask(userId, { title: "Buy paint", scope: { view: "inbox" }, today })

    expect(await storedTask(taskId)).toMatchObject({ dueDate: null, listId: null })
  })

  it("can take an explicit deadline and list instead", async () => {
    const homeId = await givenList("Home renovation")

    const taskId = await createTask(userId, {
      title: "Call the dentist",
      due: { date: "2026-10-23", time: "15:00" },
      listId: homeId,
    })

    const workspace = await getWorkspace(userId, { listId: homeId }, today)
    expect(workspace?.todo).toEqual([
      expect.objectContaining({ id: taskId, due: { date: "2026-10-23", time: "15:00" } }),
    ])
  })

  it("puts a task added to a list in that list", async () => {
    const homeId = await givenList("Home renovation")

    const taskId = await createTask(userId, { title: "Buy paint", scope: { listId: homeId }, today })

    expect(await storedTask(taskId)).toMatchObject({ dueDate: null, listId: homeId })
  })

  it("can add a task to a list shared with the user", async () => {
    const homeId = await givenList("Home renovation", { owner: otherUserId })
    await givenShared(homeId)

    const taskId = await createTask(userId, { title: "Buy paint", scope: { listId: homeId }, today })

    expect(await storedTask(taskId)).toMatchObject({ listId: homeId })
  })

  it("leaves the task without a list when the user can't access the list", async () => {
    const otherListId = await givenList("Someone else's list", { owner: otherUserId })

    const taskId = await createTask(userId, { title: "Buy paint", due: null, listId: otherListId })

    expect(await storedTask(taskId)).toMatchObject({ listId: null })
  })

  it("creates a new list for the task, with the next color, instead of the scope's list", async () => {
    const homeId = await givenList("Home renovation")

    const taskId = await createTask(userId, {
      title: "Plan trip",
      scope: { listId: homeId },
      today,
      newList: "Summer holiday",
    })

    const { listId } = await storedTask(taskId)
    expect(listId).not.toBe(homeId)
    const workspace = await getWorkspace(userId, { listId: listId! }, today)
    expect(workspace?.title).toBe("Summer holiday")
    expect(workspace?.lists[1]).toMatchObject({ name: "Summer holiday", color: "orange", owned: true })
    expect(titles(workspace?.todo)).toEqual(["Plan trip"])
  })

  it("can create a new list alongside an explicit deadline", async () => {
    const taskId = await createTask(userId, { title: "Plan trip", due: null, listId: null, newList: "Summer holiday" })

    const overview = await getOverview(userId, today)
    expect(overview.lists).toEqual([expect.objectContaining({ id: (await storedTask(taskId)).listId, name: "Summer holiday" })])
  })

  it("leaves no empty list behind when the task can't be added", async () => {
    await expect(
      createTask(userId, { title: null as unknown as string, due: null, listId: null, newList: "Summer holiday" }),
    ).rejects.toThrow()

    expect((await getOverview(userId, today)).lists).toEqual([])
  })

  it("lets a deadline or list read from the title override the scope's", async () => {
    const websiteId = await givenList("Website relaunch")
    const homeId = await givenList("Home renovation")

    const dueId = await createTask(userId, {
      title: "Buy paint",
      scope: { view: "today" },
      today,
      due: { date: "2026-10-26", time: null },
    })
    const listedId = await createTask(userId, { title: "Buy paint", scope: { listId: websiteId }, today, listId: homeId })

    expect(await storedTask(dueId)).toMatchObject({ dueDate: "2026-10-26", listId: null })
    expect(await storedTask(listedId)).toMatchObject({ dueDate: null, listId: homeId })
  })
})

describe("updateTask", () => {
  it("only changes the given fields", async () => {
    const taskId = await givenTask({ title: "Old title", description: "Notes", dueDate: today })

    await updateTask(userId, taskId, { title: "New title" })

    expect(await storedTask(taskId)).toMatchObject({ title: "New title", description: "Notes", dueDate: today })
  })

  it("completes a task, keeps when it was first completed, and opens it again", async () => {
    const taskId = await givenTask()

    await updateTask(userId, taskId, { completed: true })
    const { completedAt } = await storedTask(taskId)
    await updateTask(userId, taskId, { completed: true })

    expect(completedAt).toBeInstanceOf(Date)
    expect((await storedTask(taskId)).completedAt).toEqual(completedAt)

    await updateTask(userId, taskId, { completed: false })
    expect((await storedTask(taskId)).completedAt).toBeNull()
  })

  it("sets and clears deadlines", async () => {
    const taskId = await givenTask()

    await updateTask(userId, taskId, { due: { date: today, time: "14:00" } })
    expect(await storedTask(taskId)).toMatchObject({ dueDate: today, dueTime: "14:00:00" })

    await updateTask(userId, taskId, { due: null })
    expect(await storedTask(taskId)).toMatchObject({ dueDate: null, dueTime: null })
  })

  it("moves the task to a list the user owns or was given access to", async () => {
    const homeId = await givenList("Home renovation", { owner: otherUserId })
    await givenShared(homeId)
    const taskId = await givenTask()

    await updateTask(userId, taskId, { listId: homeId })

    expect(await storedTask(taskId)).toMatchObject({ listId: homeId })
  })

  it("takes the task out of its list rather than moving it to a list the user can't access", async () => {
    const websiteId = await givenList("Website relaunch")
    const otherListId = await givenList("Someone else's list", { owner: otherUserId })
    const taskId = await givenTask({ listId: websiteId })

    await updateTask(userId, taskId, { listId: otherListId })

    expect(await storedTask(taskId)).toMatchObject({ listId: null })
  })

  it("changes tasks in lists shared with the user, but no other people's tasks", async () => {
    const homeId = await givenList("Home renovation", { owner: otherUserId })
    await givenShared(homeId)
    const sharedId = await givenTask({ userId: otherUserId, listId: homeId, title: "Shared" })
    const privateId = await givenTask({ userId: otherUserId, title: "Private" })

    await updateTask(userId, sharedId, { title: "Changed" })
    await updateTask(userId, privateId, { title: "Changed" })

    expect(await storedTask(sharedId)).toMatchObject({ title: "Changed" })
    expect(await storedTask(privateId)).toMatchObject({ title: "Private" })
  })

  it("does nothing without changes", async () => {
    const taskId = await givenTask({ title: "Untouched" })

    await updateTask(userId, taskId, {})

    expect(await storedTask(taskId)).toMatchObject({ title: "Untouched" })
  })
})

describe("deleteTask", () => {
  it("deletes a task the user can access, but no other people's tasks", async () => {
    const mineId = await givenTask()
    const otherId = await givenTask({ userId: otherUserId })

    await deleteTask(userId, mineId)
    await deleteTask(userId, otherId)

    expect(await storedTask(mineId)).toBeUndefined()
    expect(await storedTask(otherId)).toBeDefined()
  })
})

describe("subtasks", () => {
  const subtasksOf = (taskId: string) =>
    db.select({ title: subtasks.title, done: subtasks.done }).from(subtasks).where(eq(subtasks.taskId, taskId))

  it("adds a subtask to a task the user can access, but not to other people's tasks", async () => {
    const mineId = await givenTask()
    const otherId = await givenTask({ userId: otherUserId })

    await addSubtask(userId, mineId, "Leave review comments")
    await addSubtask(userId, otherId, "Leave review comments")

    expect(await subtasksOf(mineId)).toEqual([{ title: "Leave review comments", done: false }])
    expect(await subtasksOf(otherId)).toEqual([])
  })

  it("checks off a subtask of a task the user can access", async () => {
    const mineId = await givenTask()
    const otherId = await givenTask({ userId: otherUserId })
    const mySubtaskId = await givenSubtask(mineId, "Mine")
    const otherSubtaskId = await givenSubtask(otherId, "Theirs")

    await updateSubtask(userId, mySubtaskId, { done: true })
    await updateSubtask(userId, otherSubtaskId, { done: true })

    expect(await subtasksOf(mineId)).toEqual([{ title: "Mine", done: true }])
    expect(await subtasksOf(otherId)).toEqual([{ title: "Theirs", done: false }])
  })

  it("deletes a subtask of a task the user can access", async () => {
    const mineId = await givenTask()
    const otherId = await givenTask({ userId: otherUserId })
    const mySubtaskId = await givenSubtask(mineId, "Mine")
    const otherSubtaskId = await givenSubtask(otherId, "Theirs")

    await deleteSubtask(userId, mySubtaskId)
    await deleteSubtask(userId, otherSubtaskId)

    expect(await subtasksOf(mineId)).toEqual([])
    expect(await subtasksOf(otherId)).toHaveLength(1)
  })
})

describe("createList", () => {
  it("gives each new list the next color, starting over after the last one", async () => {
    const ids = []
    for (const name of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
      ids.push(await createList(userId, name))
    }

    const overview = await getOverview(userId, today)
    expect(overview.lists.map((list) => list.id)).toEqual(ids)
    expect(overview.lists.map((list) => list.color)).toEqual([
      "blue",
      "orange",
      "emerald",
      "violet",
      "amber",
      "rose",
      "cyan",
      "blue",
    ])
  })
})

describe("deleteList", () => {
  it("deletes the user's list and keeps its tasks", async () => {
    const homeId = await givenList("Home renovation")
    const taskId = await givenTask({ listId: homeId })

    await deleteList(userId, homeId)

    expect((await getOverview(userId, today)).lists).toEqual([])
    expect(await storedTask(taskId)).toMatchObject({ listId: null })
  })

  it("does not delete a list someone else owns, even when it was shared with the user", async () => {
    const homeId = await givenList("Home renovation", { owner: otherUserId })
    await givenShared(homeId)

    await deleteList(userId, homeId)

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(lists)
    expect(count).toBe(1)
  })
})
