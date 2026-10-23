"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/accounts";
import * as tasks from "@/lib/tasks";
import {
  listSchema,
  newTaskSchema,
  quickAddSchema,
  scopeSchema,
  subtaskSchema,
  taskChangesSchema,
  type ListValues,
  type NewTaskValues,
  type QuickAddValues,
  type SubtaskValues,
  type TaskChanges,
} from "@/lib/tasks/schemas";
import { hrefFor } from "@/lib/tasks/routes";
import type { Scope } from "@/lib/tasks/types";
import { getToday } from "./today";

type ActionResult = { error: string } | undefined;

const id = z.uuid();

export async function createTaskAction(scope: Scope, values: NewTaskValues): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const parsedScope = scopeSchema.safeParse(scope);
  const parsed = newTaskSchema.safeParse(values);
  if (!parsedScope.success) return invalid();
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const taskId = await tasks.createTask(userId, { ...parsed.data, scope: parsedScope.data, today: await getToday() });
  refresh();
  return { id: taskId };
}

// Adds a task from the command palette, with the deadline and list recognised in its text.
export async function quickAddTaskAction(values: QuickAddValues): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const parsed = quickAddSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const taskId = await tasks.createTask(userId, parsed.data);
  refresh();
  return { id: taskId };
}

export async function updateTaskAction(taskId: string, changes: TaskChanges): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = taskChangesSchema.safeParse(changes);
  if (!id.safeParse(taskId).success) return invalid();
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await tasks.updateTask(userId, taskId, parsed.data);
  refresh();
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(taskId).success) return invalid();

  await tasks.deleteTask(userId, taskId);
  refresh();
}

export async function addSubtaskAction(taskId: string, values: SubtaskValues): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = subtaskSchema.safeParse(values);
  if (!id.safeParse(taskId).success) return invalid();
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await tasks.addSubtask(userId, taskId, parsed.data.title);
  refresh();
}

export async function updateSubtaskAction(subtaskId: string, changes: { done: boolean }): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = z.object({ done: z.boolean() }).safeParse(changes);
  if (!id.safeParse(subtaskId).success || !parsed.success) return invalid();

  await tasks.updateSubtask(userId, subtaskId, parsed.data);
  refresh();
}

export async function deleteSubtaskAction(subtaskId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(subtaskId).success) return invalid();

  await tasks.deleteSubtask(userId, subtaskId);
  refresh();
}

export async function createListAction(values: ListValues): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const parsed = listSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const listId = await tasks.createList(userId, parsed.data.name);
  refresh();
  return { id: listId };
}

// Deletes a list, keeping its tasks. Pass leave when the user is looking at the list, so they land in the
// inbox instead of on a list that no longer exists.
export async function deleteListAction(listId: string, { leave }: { leave: boolean }): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(listId).success) return invalid();

  await tasks.deleteList(userId, listId);
  if (leave) redirect(hrefFor({ view: "inbox" }));
  refresh();
}

// Server actions are reachable by direct POST, so each one checks the session itself.
async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

function invalid() {
  return { error: "Invalid request" };
}
