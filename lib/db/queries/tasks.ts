import { and, asc, count, desc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { lists, subtasks, tasks } from "@/lib/db/schema";
import type { Due } from "@/lib/tasks/deadlines";
import type { TaskChanges } from "@/lib/tasks/schemas";
import { listColors } from "@/lib/tasks/types";
import { accessibleListId, accessibleLists, accessibleTasks } from "./access";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Completed tasks stay visible in their view for this long.
const completedRetention = sql`interval '7 days'`;

// The lists the user owns or was given access to, oldest first. owned is false for a shared list.
export function findLists(userId: string) {
  return db
    .select({ id: lists.id, name: lists.name, color: lists.color, owned: sql<boolean>`${lists.userId} = ${userId}` })
    .from(lists)
    .where(accessibleLists(userId))
    .orderBy(asc(lists.createdAt));
}

// Open tasks plus recently completed ones with their subtasks: the user's own and those in lists shared with
// them. Open tasks come first (desc puts nulls first), then the earliest deadline (asc puts nulls last).
export function findTasks(userId: string) {
  return db.query.tasks.findMany({
    columns: { id: true, title: true, description: true, dueDate: true, dueTime: true, listId: true, completedAt: true },
    with: {
      subtasks: { columns: { id: true, title: true, done: true }, orderBy: [asc(subtasks.createdAt)] },
    },
    where: and(
      accessibleTasks(userId),
      or(isNull(tasks.completedAt), gt(tasks.completedAt, sql`now() - ${completedRetention}`)),
    ),
    orderBy: [desc(tasks.completedAt), asc(tasks.dueDate), asc(tasks.dueTime), asc(tasks.createdAt)],
  });
}

// Adds a task, in the given list when the user can access it. newList names a list to create for the task
// instead; it goes in with the task, so a failed insert leaves no empty list behind. Returns the task's id.
export async function insertTask(
  userId: string,
  task: { title: string; due: Due | null; listId: string | null; newList?: string },
): Promise<string> {
  const { title, due, listId, newList } = task;
  const insert = async (executor: Transaction | typeof db, list: ReturnType<typeof accessibleListId> | string) => {
    const [{ id }] = await executor
      .insert(tasks)
      .values({ userId, title, dueDate: due?.date ?? null, dueTime: due?.time ?? null, listId: list })
      .returning({ id: tasks.id });
    return id;
  };

  if (!newList) {
    return insert(db, accessibleListId(userId, listId));
  }
  return db.transaction(async (tx) => insert(tx, await insertList(userId, newList, tx)));
}

// Changes the given fields of a task the user can access.
export async function updateTask(userId: string, taskId: string, changes: TaskChanges): Promise<void> {
  const set: PgUpdateSetSource<typeof tasks> = {};
  if (changes.title !== undefined) set.title = changes.title;
  if (changes.description !== undefined) set.description = changes.description;
  if (changes.due !== undefined) {
    set.dueDate = changes.due?.date ?? null;
    set.dueTime = changes.due?.time ?? null;
  }
  if (changes.listId !== undefined) set.listId = accessibleListId(userId, changes.listId);
  // Completing a task again keeps when it was first completed.
  if (changes.completed !== undefined) set.completedAt = changes.completed ? sql`coalesce(${tasks.completedAt}, now())` : null;

  if (Object.keys(set).length === 0) {
    return;
  }
  await db.update(tasks).set(set).where(and(eq(tasks.id, taskId), accessibleTasks(userId)));
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await db.delete(tasks).where(and(eq(tasks.id, taskId), accessibleTasks(userId)));
}

// Adds a subtask to a task the user can access.
export async function insertSubtask(userId: string, taskId: string, title: string): Promise<void> {
  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), accessibleTasks(userId)));
  if (task) {
    await db.insert(subtasks).values({ taskId: task.id, title });
  }
}

export async function updateSubtask(userId: string, subtaskId: string, { done }: { done: boolean }): Promise<void> {
  await db.update(subtasks).set({ done }).where(and(eq(subtasks.id, subtaskId), ofAccessibleTask(userId)));
}

export async function deleteSubtask(userId: string, subtaskId: string): Promise<void> {
  await db.delete(subtasks).where(and(eq(subtasks.id, subtaskId), ofAccessibleTask(userId)));
}

function ofAccessibleTask(userId: string) {
  return inArray(subtasks.taskId, db.select({ id: tasks.id }).from(tasks).where(accessibleTasks(userId)));
}

// Creates a list with the next color in the palette. Returns the new list's id.
export async function insertList(userId: string, name: string, executor: Transaction | typeof db = db): Promise<string> {
  const [{ owned }] = await executor.select({ owned: count() }).from(lists).where(eq(lists.userId, userId));
  const [{ id }] = await executor
    .insert(lists)
    .values({ userId, name, color: listColors[owned % listColors.length] })
    .returning({ id: lists.id });
  return id;
}

// Deletes a list the user owns. Its tasks stay, without a list (the foreign key sets list_id to null).
export async function deleteList(userId: string, listId: string): Promise<void> {
  await db.delete(lists).where(and(eq(lists.id, listId), eq(lists.userId, userId)));
}
