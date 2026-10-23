"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, type User } from "@/lib/accounts";
import * as sharing from "@/lib/sharing";
import { inviteSchema, type InviteValues } from "@/lib/sharing/schemas";
import * as tasks from "@/lib/tasks";
import {
  listSchema,
  quickAddSchema,
  scopedTaskSchema,
  scopeSchema,
  subtaskSchema,
  taskChangesSchema,
  type ListValues,
  type QuickAddValues,
  type ScopedTaskValues,
  type SubtaskValues,
  type TaskChanges,
} from "@/lib/tasks/schemas";
import { hrefFor } from "@/lib/tasks/routes";
import type { Scope } from "@/lib/tasks/types";
import { getToday } from "./today";

type ActionResult = { error: string } | undefined;

const id = z.uuid();

export async function createTaskAction(scope: Scope, values: ScopedTaskValues): Promise<{ id: string } | { error: string }> {
  const userId = await requireUserId();
  const parsedScope = scopeSchema.safeParse(scope);
  const parsed = scopedTaskSchema.safeParse(values);
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

// Invites one or more email addresses to a list the user owns.
export async function inviteToListAction(listId: string, values: InviteValues): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = inviteSchema.safeParse(values);
  if (!id.safeParse(listId).success) return invalid();
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const result = await sharing.inviteToList(userId, listId, parsed.data.emails);
  refresh();
  return result;
}

export async function resendInviteAction(inviteId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(inviteId).success) return invalid();

  await sharing.resendInvite(userId, inviteId);
  refresh();
}

export async function revokeInviteAction(inviteId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(inviteId).success) return invalid();

  await sharing.revokeInvite(userId, inviteId);
  refresh();
}

export async function removeMemberAction(listId: string, memberId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(listId).success || !z.string().min(1).safeParse(memberId).success) return invalid();

  await sharing.removeMember(userId, listId, memberId);
  refresh();
}

export async function respondToInvitationAction(inviteId: string, answer: { accept: boolean }): Promise<ActionResult> {
  const { id: userId, email } = await requireUser();
  const parsed = z.object({ accept: z.boolean() }).safeParse(answer);
  if (!id.safeParse(inviteId).success || !parsed.success) return invalid();

  await sharing.respondToInvitation({ id: userId, email }, inviteId, parsed.data);
  refresh();
}

// Leaves a list someone shared with the user. Pass leave when the user is looking at the list.
export async function leaveListAction(listId: string, { leave }: { leave: boolean }): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id.safeParse(listId).success) return invalid();

  await sharing.leaveList(userId, listId);
  if (leave) redirect(hrefFor({ view: "inbox" }));
  refresh();
}

// Server actions are reachable by direct POST, so each one checks the session itself.
async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

async function requireUserId(): Promise<string> {
  return (await requireUser()).id;
}

function invalid() {
  return { error: "Invalid request" };
}
