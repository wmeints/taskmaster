import "server-only";
import { cache } from "react";
import { z } from "zod";
import { findLists, findTasks, insertTask } from "@/lib/db/queries";
import { dateForPreset, viewOf, type Due, type View } from "./deadlines";
import { viewTitles, type Scope, type Task, type Workspace, type Overview } from "./types";

export type { List, Overview, Scope, Task, Workspace } from "./types";

export {
  deleteList,
  deleteSubtask,
  deleteTask,
  insertList as createList,
  insertSubtask as addSubtask,
  updateSubtask,
  updateTask,
} from "@/lib/db/queries";

type ListRow = Awaited<ReturnType<typeof findLists>>[number];
type TaskRow = Awaited<ReturnType<typeof findTasks>>[number];

// What the sidebar and search show for the user, whichever view or list is open.
export async function getOverview(userId: string, today: string): Promise<Overview> {
  const { overview } = await load(userId, today);
  return overview;
}

// Everything the main screen shows for one view or list. Returns null for a list the user doesn't have.
export async function getWorkspace(userId: string, scope: Scope, today: string): Promise<Workspace | null> {
  if ("listId" in scope && !z.uuid().safeParse(scope.listId).success) {
    return null;
  }

  const { overview, tasks, listsById } = await load(userId, today);
  const title = "view" in scope ? viewTitles[scope.view] : listsById.get(scope.listId)?.name;
  if (title === undefined) {
    return null;
  }

  const inScope = (task: Task) =>
    "view" in scope ? viewOf(task.due?.date ?? null, today) === scope.view : task.list?.id === scope.listId;

  return {
    ...overview,
    title,
    scope,
    today,
    todo: tasks.filter((task) => !task.completed && inScope(task)),
    completed: tasks.filter((task) => task.completed && inScope(task)),
  };
}

// The layout and the page both read the workspace while rendering one request; cache() lets them share
// the queries.
const load = cache(async (userId: string, today: string) => {
  const [listRows, taskRows] = await Promise.all([findLists(userId), findTasks(userId)]);
  const listsById = new Map(listRows.map((list) => [list.id, list]));
  const tasks = taskRows.map((row) => toTask(row, listsById));
  const open = tasks.filter((task) => !task.completed);

  const overview: Overview = {
    counts: countByView(open, today),
    lists: listRows.map((list) => ({
      ...list,
      openCount: open.filter((task) => task.list?.id === list.id).length,
    })),
    searchable: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      view: viewOf(task.due?.date ?? null, today),
      completed: task.completed,
    })),
  };
  return { overview, tasks, listsById };
});

// Adds a task to a view (taking that view's deadline) or to a list, or with an explicit deadline and list.
// Returns the new task's id.
export async function createTask(
  userId: string,
  // newList names a list to create for the task, in place of any other list.
  task: { title: string; newList?: string } & (
    // A deadline or list given with a scope, such as one read from the title, overrides the scope's.
    { scope: Scope; today: string; due?: Due; listId?: string } | { due: Due | null; listId: string | null }
  ),
): Promise<string> {
  const { title, newList } = task;
  let due: Due | null;
  let listId: string | null;
  if ("scope" in task) {
    const { scope, today } = task;
    const date = "view" in scope && scope.view !== "inbox" ? dateForPreset(scope.view, today) : null;
    due = task.due ?? (date ? { date, time: null } : null);
    listId = task.listId ?? ("listId" in scope ? scope.listId : null);
  } else {
    ({ due, listId } = task);
  }
  return insertTask(userId, { title, due, listId, newList });
}

function toTask(row: TaskRow, listsById: Map<string, ListRow>): Task {
  const list = row.listId ? listsById.get(row.listId) : undefined;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    // Postgres gives times as HH:MM:SS; tasks only keep hours and minutes.
    due: row.dueDate ? { date: row.dueDate, time: row.dueTime?.slice(0, 5) ?? null } : null,
    list: list ? { id: list.id, name: list.name, color: list.color } : null,
    completed: row.completedAt !== null,
    subtasks: row.subtasks,
  };
}

function countByView(open: Task[], today: string): Record<View, number> {
  const counts: Record<View, number> = { inbox: 0, today: 0, tomorrow: 0, "end-of-week": 0, later: 0 };
  for (const task of open) {
    counts[viewOf(task.due?.date ?? null, today)]++;
  }
  return counts;
}
