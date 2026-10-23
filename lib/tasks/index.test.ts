import { beforeEach, describe, expect, it, vi } from "vitest"

const { pool } = vi.hoisted(() => ({ pool: { query: vi.fn() } }))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db", () => ({ pool }))

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

const userId = "user-1"
const today = "2026-10-21"
const websiteId = "11111111-1111-4111-8111-111111111111"
const homeId = "22222222-2222-4222-8222-222222222222"
const taskId = "33333333-3333-4333-8333-333333333333"
const subtaskId = "44444444-4444-4444-8444-444444444444"

const listRows = [
  { id: websiteId, name: "Website relaunch", color: "blue" },
  { id: homeId, name: "Home renovation", color: "orange" },
]

function taskRow(overrides: Record<string, unknown>) {
  return {
    id: crypto.randomUUID(),
    title: "Task",
    description: "",
    due_date: null,
    due_time: null,
    list_id: null,
    completed: false,
    subtasks: [],
    ...overrides,
  }
}

// Answers the workspace's two reads: the user's lists and their tasks.
function givenData(tasks: ReturnType<typeof taskRow>[], lists = listRows) {
  pool.query.mockImplementation(async (sql: string) =>
    sql.includes("from lists") ? { rows: lists } : { rows: tasks },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getWorkspace", () => {
  it("shows the open and completed tasks of a view", async () => {
    givenData([
      taskRow({ title: "Review pull request", due_date: today, due_time: "14:00", list_id: websiteId }),
      taskRow({ title: "Pay the electricity bill", due_date: today, completed: true }),
      taskRow({ title: "Buy paint", due_date: "2026-10-22" }),
    ])

    const workspace = await getWorkspace(userId, { view: "today" }, today)

    expect(workspace?.title).toBe("Today")
    expect(workspace?.todo.map((task) => task.title)).toEqual(["Review pull request"])
    expect(workspace?.completed.map((task) => task.title)).toEqual(["Pay the electricity bill"])
    expect(workspace?.todo[0]).toMatchObject({
      due: { date: today, time: "14:00" },
      list: { id: websiteId, name: "Website relaunch", color: "blue" },
      completed: false,
    })
  })

  it("only reads the signed-in user's data", async () => {
    givenData([])

    await getWorkspace(userId, { view: "inbox" }, today)

    for (const [, params] of pool.query.mock.calls) {
      expect(params[0]).toBe(userId)
    }
  })

  it("counts open tasks per view and per list", async () => {
    givenData([
      taskRow({ due_date: null }),
      taskRow({ due_date: "2026-10-01", list_id: homeId }),
      taskRow({ due_date: today, list_id: websiteId }),
      taskRow({ due_date: today, completed: true, list_id: websiteId }),
      taskRow({ due_date: "2026-10-22" }),
      taskRow({ due_date: "2026-10-24", list_id: websiteId }),
      taskRow({ due_date: "2026-12-01" }),
    ])

    const workspace = await getWorkspace(userId, { view: "today" }, today)

    expect(workspace?.counts).toEqual({ inbox: 1, today: 2, tomorrow: 1, "end-of-week": 1, later: 1 })
    expect(workspace?.lists).toEqual([
      { id: websiteId, name: "Website relaunch", color: "blue", openCount: 2 },
      { id: homeId, name: "Home renovation", color: "orange", openCount: 1 },
    ])
  })

  it("shows every task of a list regardless of deadline", async () => {
    givenData([
      taskRow({ title: "Draft release notes", due_date: today, list_id: websiteId }),
      taskRow({ title: "Write blog post", due_date: null, list_id: websiteId }),
      taskRow({ title: "Call the plumber", due_date: today, list_id: homeId }),
    ])

    const workspace = await getWorkspace(userId, { listId: websiteId }, today)

    expect(workspace?.title).toBe("Website relaunch")
    expect(workspace?.todo.map((task) => task.title)).toEqual(["Draft release notes", "Write blog post"])
  })

  it("returns null for a list the user does not have", async () => {
    givenData([])

    await expect(getWorkspace(userId, { listId: crypto.randomUUID() }, today)).resolves.toBeNull()
  })

  it("returns null for a malformed list id without querying", async () => {
    await expect(getWorkspace(userId, { listId: "nope" }, today)).resolves.toBeNull()
    expect(pool.query).not.toHaveBeenCalled()
  })

  it("lists the open tasks of every view for search", async () => {
    givenData([
      taskRow({ id: taskId, title: "Buy paint", due_date: "2026-10-22" }),
      taskRow({ title: "Done already", completed: true }),
    ])

    const workspace = await getWorkspace(userId, { view: "inbox" }, today)

    expect(workspace?.searchable).toEqual([{ id: taskId, title: "Buy paint", view: "tomorrow" }])
  })

  it("includes subtasks", async () => {
    const subtasks = [{ id: subtaskId, title: "Run the branch locally", done: true }]
    givenData([taskRow({ subtasks })])

    const workspace = await getWorkspace(userId, { view: "inbox" }, today)

    expect(workspace?.todo[0].subtasks).toEqual(subtasks)
  })
})

describe("getOverview", () => {
  it("counts open tasks per view and per list and lists them for search", async () => {
    givenData([
      taskRow({ id: taskId, title: "Buy paint", due_date: "2026-10-22", list_id: homeId }),
      taskRow({ title: "Done already", due_date: today, completed: true, list_id: homeId }),
    ])

    const overview = await getOverview(userId, today)

    expect(overview).toEqual({
      counts: { inbox: 0, today: 0, tomorrow: 1, "end-of-week": 0, later: 0 },
      lists: [
        { id: websiteId, name: "Website relaunch", color: "blue", openCount: 0 },
        { id: homeId, name: "Home renovation", color: "orange", openCount: 1 },
      ],
      searchable: [{ id: taskId, title: "Buy paint", view: "tomorrow" }],
    })
  })
})

describe("createTask", () => {
  beforeEach(() => {
    pool.query.mockResolvedValue({ rows: [{ id: taskId }] })
  })

  it("gives a task added to a view that view's deadline", async () => {
    await expect(createTask(userId, { title: "Buy paint", scope: { view: "tomorrow" }, today })).resolves.toBe(taskId)

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("insert into tasks"), [
      userId,
      "Buy paint",
      "2026-10-22",
      null,
    ])
  })

  it("leaves tasks added to the inbox without a deadline", async () => {
    await createTask(userId, { title: "Buy paint", scope: { view: "inbox" }, today })

    expect(pool.query.mock.calls[0][1]).toEqual([userId, "Buy paint", null, null])
  })

  it("puts a task added to a list in that list", async () => {
    await createTask(userId, { title: "Buy paint", scope: { listId: homeId }, today })

    expect(pool.query.mock.calls[0][1]).toEqual([userId, "Buy paint", null, homeId])
  })
})

describe("updateTask", () => {
  it("only changes the given fields of the user's task", async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await updateTask(userId, taskId, { title: "New title", completed: true })

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toMatch(/update tasks set title = \$3, completed_at = .* where id = \$2 and user_id = \$1/)
    expect(params).toEqual([userId, taskId, "New title", true])
  })

  it("sets and clears deadlines", async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await updateTask(userId, taskId, { due: { date: today, time: "14:00" } })
    await updateTask(userId, taskId, { due: null })

    expect(pool.query.mock.calls[0][1]).toEqual([userId, taskId, today, "14:00"])
    expect(pool.query.mock.calls[1][1]).toEqual([userId, taskId, null, null])
  })

  it("only moves the task to a list the user owns", async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await updateTask(userId, taskId, { listId: homeId })

    expect(pool.query.mock.calls[0][0]).toContain("list_id = (select id from lists where id = $3 and user_id = $1)")
  })

  it("does nothing without changes", async () => {
    await updateTask(userId, taskId, {})

    expect(pool.query).not.toHaveBeenCalled()
  })
})

describe("deleteTask", () => {
  it("deletes the user's task", async () => {
    pool.query.mockResolvedValue({ rows: [] })

    await deleteTask(userId, taskId)

    expect(pool.query).toHaveBeenCalledWith(expect.stringMatching(/delete from tasks .*user_id = \$1/), [userId, taskId])
  })
})

describe("subtasks", () => {
  beforeEach(() => {
    pool.query.mockResolvedValue({ rows: [] })
  })

  it("adds a subtask to the user's task", async () => {
    await addSubtask(userId, taskId, "Leave review comments")

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("insert into subtasks")
    expect(sql).toContain("user_id = $1")
    expect(params).toEqual([userId, taskId, "Leave review comments"])
  })

  it("checks off a subtask of the user's task", async () => {
    await updateSubtask(userId, subtaskId, { done: true })

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("select id from tasks where user_id = $1")
    expect(params).toEqual([userId, subtaskId, true])
  })

  it("deletes a subtask of the user's task", async () => {
    await deleteSubtask(userId, subtaskId)

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("select id from tasks where user_id = $1")
    expect(params).toEqual([userId, subtaskId])
  })
})

describe("createList", () => {
  it("gives each new list the next color", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: homeId }] })

    await expect(createList(userId, "Reading")).resolves.toBe(homeId)

    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("insert into lists")
    expect(params[0]).toBe(userId)
    expect(params[1]).toBe("Reading")
    expect(params[2]).toEqual(expect.arrayContaining(["blue", "orange", "emerald"]))
  })
})

describe("deleteList", () => {
  it("deletes the user's list and keeps its tasks", async () => {
    await deleteList(userId, homeId)

    expect(pool.query).toHaveBeenCalledTimes(1)
    const [sql, params] = pool.query.mock.calls[0]
    expect(sql).toContain("delete from lists")
    expect(sql).toContain("user_id = $1")
    expect(sql).not.toContain("tasks")
    expect(params).toEqual([userId, homeId])
  })
})
