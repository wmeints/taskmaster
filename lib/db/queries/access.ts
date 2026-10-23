import { and, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { listMembers, lists, tasks } from "@/lib/db/schema";

// Who may see and change what. Every query that reads or writes on a user's behalf filters with these.

// The lists the user owns or was given access to.
export function accessibleLists(userId: string): SQL {
  return or(
    eq(lists.userId, userId),
    inArray(lists.id, db.select({ id: listMembers.listId }).from(listMembers).where(eq(listMembers.userId, userId))),
  )!;
}

// The tasks the user can see and change: their own and every task in an accessible list.
export function accessibleTasks(userId: string): SQL {
  return or(
    eq(tasks.userId, userId),
    inArray(tasks.listId, db.select({ id: lists.id }).from(lists).where(accessibleLists(userId))),
  )!;
}

// Only the owner of a list decides who has access to it.
export function ownedLists(userId: string) {
  return db.select({ id: lists.id }).from(lists).where(eq(lists.userId, userId));
}

// The list's id when the user can access it, and no list otherwise, so a task never leaks into someone
// else's list.
export function accessibleListId(userId: string, listId: string | null): SQL | null {
  if (listId === null) {
    return null;
  }
  return sql`(${db.select({ id: lists.id }).from(lists).where(and(eq(lists.id, listId), accessibleLists(userId)))})`;
}
