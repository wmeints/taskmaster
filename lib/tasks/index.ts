import "server-only";
import { cache } from "react";
import { z } from "zod";
import { pool } from "@/lib/db";
import { dateForPreset, viewOf, type View } from "./deadlines";
import type { TaskChanges } from "./schemas";
import { listColors, viewTitles, type ListColor, type Overview, type Scope, type Subtask, type Task, type Workspace } from "./types";

export type { List, Overview, Scope, Task, Workspace } from "./types";

// Completed tasks stay visible in their view for this long.
const completedRetention = "7 days";

type ListRow = { id: string; name: string; color: ListColor };

type TaskRow = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  due_time: string | null;
  list_id: string | null;
  completed: boolean;
  subtasks: Subtask[];
};

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
    searchable: open.map((task) => ({ id: task.id, title: task.title, view: viewOf(task.due?.date ?? null, today) })),
  };
  return { overview, tasks, listsById };
});

// Adds a task to a view (taking that view's deadline) or to a list. Returns the new task's id.
export async function createTask(
  userId: string,
  { title, scope, today }: { title: string; scope: Scope; today: string },
): Promise<string> {
  const dueDate = "view" in scope && scope.view !== "inbox" ? dateForPreset(scope.view, today) : null;
  const listId = "listId" in scope ? scope.listId : null;
  const { rows } = await pool.query<{ id: string }>(
    `insert into tasks (user_id, title, due_date, list_id)
     values ($1, $2, $3, (select id from lists where id = $4 and user_id = $1))
     returning id`,
    [userId, title, dueDate, listId],
  );
  return rows[0].id;
}

export async function updateTask(userId: string, taskId: string, changes: TaskChanges): Promise<void> {
  const params: unknown[] = [userId, taskId];
  const param = (value: unknown) => `$${params.push(value)}`;
  const assignments: string[] = [];

  if (changes.title !== undefined) assignments.push(`title = ${param(changes.title)}`);
  if (changes.description !== undefined) assignments.push(`description = ${param(changes.description)}`);
  if (changes.due !== undefined) {
    assignments.push(`due_date = ${param(changes.due?.date ?? null)}`, `due_time = ${param(changes.due?.time ?? null)}`);
  }
  if (changes.listId !== undefined) {
    // A list id the user doesn't own resolves to no list rather than leaking into someone else's.
    assignments.push(`list_id = (select id from lists where id = ${param(changes.listId)} and user_id = $1)`);
  }
  if (changes.completed !== undefined) {
    assignments.push(`completed_at = case when ${param(changes.completed)} then coalesce(completed_at, now()) end`);
  }

  if (assignments.length === 0) {
    return;
  }
  await pool.query(`update tasks set ${assignments.join(", ")} where id = $2 and user_id = $1`, params);
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await pool.query("delete from tasks where id = $2 and user_id = $1", [userId, taskId]);
}

export async function addSubtask(userId: string, taskId: string, title: string): Promise<void> {
  await pool.query(
    "insert into subtasks (task_id, title) select id, $3 from tasks where id = $2 and user_id = $1",
    [userId, taskId, title],
  );
}

export async function updateSubtask(userId: string, subtaskId: string, { done }: { done: boolean }): Promise<void> {
  await pool.query(
    `update subtasks set done = $3
     where id = $2 and task_id in (select id from tasks where user_id = $1)`,
    [userId, subtaskId, done],
  );
}

export async function deleteSubtask(userId: string, subtaskId: string): Promise<void> {
  await pool.query(
    "delete from subtasks where id = $2 and task_id in (select id from tasks where user_id = $1)",
    [userId, subtaskId],
  );
}

// Creates a list with the next color in the palette. Returns the new list's id.
export async function createList(userId: string, name: string): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into lists (user_id, name, color)
     values ($1, $2, ($3::text[])[(select count(*) from lists where user_id = $1) % array_length($3::text[], 1) + 1])
     returning id`,
    [userId, name, [...listColors]],
  );
  return rows[0].id;
}

// Deletes the user's list. Its tasks stay, without a list (the foreign key sets list_id to null).
export async function deleteList(userId: string, listId: string): Promise<void> {
  await pool.query("delete from lists where id = $2 and user_id = $1", [userId, listId]);
}

async function findLists(userId: string): Promise<ListRow[]> {
  const { rows } = await pool.query<ListRow>(
    "select id, name, color from lists where user_id = $1 order by created_at",
    [userId],
  );
  return rows;
}

// Open tasks plus recently completed ones, earliest deadline first.
async function findTasks(userId: string): Promise<TaskRow[]> {
  const { rows } = await pool.query<TaskRow>(
    `select t.id, t.title, t.description, t.due_date::text as due_date,
            to_char(t.due_time, 'HH24:MI') as due_time, t.list_id, t.completed_at is not null as completed,
            coalesce(
              json_agg(json_build_object('id', s.id, 'title', s.title, 'done', s.done) order by s.created_at)
                filter (where s.id is not null),
              '[]'
            ) as subtasks
     from tasks t
     left join subtasks s on s.task_id = t.id
     where t.user_id = $1 and (t.completed_at is null or t.completed_at > now() - interval '${completedRetention}')
     group by t.id
     order by t.completed_at desc nulls first, t.due_date nulls last, t.due_time nulls last, t.created_at`,
    [userId],
  );
  return rows;
}

function toTask(row: TaskRow, listsById: Map<string, ListRow>): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    due: row.due_date ? { date: row.due_date, time: row.due_time } : null,
    list: (row.list_id && listsById.get(row.list_id)) || null,
    completed: row.completed,
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
