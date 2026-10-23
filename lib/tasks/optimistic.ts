import { viewOf } from "./deadlines"
import type { TaskChanges } from "./schemas"
import type { Subtask, Task, Workspace } from "./types"

// A change the user just made, applied to the screen before the server confirms it.
export type Change =
  | { type: "update"; taskId: string; changes: TaskChanges }
  | { type: "delete"; taskId: string }
  | { type: "add-subtask"; taskId: string; title: string }
  | { type: "update-subtask"; subtaskId: string; done: boolean }
  | { type: "delete-subtask"; subtaskId: string }

// Predicts the workspace after a change. The server's next render replaces the prediction.
export function applyChange(workspace: Workspace, change: Change): Workspace {
  switch (change.type) {
    case "update":
      return updateTask(workspace, change.taskId, change.changes)
    case "delete": {
      const task = findTask(workspace, change.taskId)
      if (!task) return workspace
      return adjustOpenCounts(
        { ...workspace, todo: without(workspace.todo, task), completed: without(workspace.completed, task) },
        task,
        task.completed ? 0 : -1,
      )
    }
    case "add-subtask":
      return mapTasks(workspace, (task) =>
        task.id === change.taskId
          ? { ...task, subtasks: [...task.subtasks, pendingSubtask(change.title)] }
          : task,
      )
    case "update-subtask":
      return mapTasks(workspace, (task) => ({
        ...task,
        subtasks: task.subtasks.map((s) => (s.id === change.subtaskId ? { ...s, done: change.done } : s)),
      }))
    case "delete-subtask":
      return mapTasks(workspace, (task) => ({
        ...task,
        subtasks: task.subtasks.filter((s) => s.id !== change.subtaskId),
      }))
  }
}

function updateTask(workspace: Workspace, taskId: string, changes: TaskChanges): Workspace {
  const task = findTask(workspace, taskId)
  if (!task) return workspace

  const list =
    changes.listId === undefined ? task.list : (workspace.lists.find((l) => l.id === changes.listId) ?? null)
  const updated: Task = {
    ...task,
    ...(changes.title !== undefined && { title: changes.title }),
    ...(changes.description !== undefined && { description: changes.description }),
    ...(changes.due !== undefined && { due: changes.due }),
    ...(changes.completed !== undefined && { completed: changes.completed }),
    list: list && { id: list.id, name: list.name, color: list.color },
  }

  if (updated.completed === task.completed) {
    return mapTasks(workspace, (t) => (t.id === taskId ? updated : t))
  }
  const moved = updated.completed
    ? { ...workspace, todo: without(workspace.todo, task), completed: [updated, ...workspace.completed] }
    : { ...workspace, todo: [...workspace.todo, updated], completed: without(workspace.completed, task) }
  return adjustOpenCounts(moved, updated, updated.completed ? -1 : 1)
}

function adjustOpenCounts(workspace: Workspace, task: Task, delta: number): Workspace {
  if (delta === 0) return workspace
  const view = viewOf(task.due?.date ?? null, workspace.today)
  return {
    ...workspace,
    counts: { ...workspace.counts, [view]: workspace.counts[view] + delta },
    lists: workspace.lists.map((l) => (l.id === task.list?.id ? { ...l, openCount: l.openCount + delta } : l)),
  }
}

function findTask(workspace: Workspace, taskId: string): Task | undefined {
  return [...workspace.todo, ...workspace.completed].find((task) => task.id === taskId)
}

function mapTasks(workspace: Workspace, map: (task: Task) => Task): Workspace {
  return { ...workspace, todo: workspace.todo.map(map), completed: workspace.completed.map(map) }
}

function without(tasks: Task[], task: Task): Task[] {
  return tasks.filter((t) => t.id !== task.id)
}

const pendingPrefix = "pending-"

// A subtask shown before the server saved it. Its id is temporary until the server's next render.
export function pendingSubtask(title: string): Subtask {
  return { id: `${pendingPrefix}${crypto.randomUUID()}`, title, done: false }
}

// Whether a subtask is still on its way to the server, so changing it would be lost.
export function isPending(subtask: Subtask): boolean {
  return subtask.id.startsWith(pendingPrefix)
}
