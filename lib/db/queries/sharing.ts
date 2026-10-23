import { and, asc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { listInvites, listMembers, lists } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/users";
import { ownedLists } from "./access";

// Neon Auth keys users by uuid; the app stores their ids as text.
const userIdText = sql<string>`${users.id}::text`;

// The people who joined the lists the user owns, in the order they joined.
export function findMembers(userId: string) {
  return db
    .select({ listId: listMembers.listId, id: users.id, name: users.name, email: users.email })
    .from(listMembers)
    .innerJoin(lists, eq(lists.id, listMembers.listId))
    .innerJoin(users, eq(userIdText, listMembers.userId))
    .where(eq(lists.userId, userId))
    .orderBy(asc(listMembers.createdAt));
}

// The invites the user sent for their lists, declined ones included, in the order they were sent.
export function findSentInvites(userId: string) {
  return db
    .select({
      listId: listInvites.listId,
      id: listInvites.id,
      email: listInvites.email,
      declined: sql<boolean>`${listInvites.declinedAt} is not null`,
    })
    .from(listInvites)
    .innerJoin(lists, eq(lists.id, listInvites.listId))
    .where(eq(lists.userId, userId))
    .orderBy(asc(listInvites.sentAt));
}

// The invitations sent to a lower-case email address that are waiting for a reply.
export function findInvitations(email: string) {
  return db
    .select({ id: listInvites.id, listName: lists.name, invitedBy: sql<string>`coalesce(${users.name}, '')` })
    .from(listInvites)
    .innerJoin(lists, eq(lists.id, listInvites.listId))
    .leftJoin(users, eq(userIdText, listInvites.invitedBy))
    .where(and(eq(listInvites.email, email), isNull(listInvites.declinedAt)))
    .orderBy(asc(listInvites.sentAt));
}

// Invites lower-case addresses to a list the user owns, skipping the owner and people who already joined.
// Inviting an address again sends the invite again. Returns how many addresses were invited.
export async function insertInvites(userId: string, listId: string, emails: string[]): Promise<number> {
  const [list] = await db
    .select({ id: lists.id })
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, userId)));
  if (!list) {
    return 0;
  }

  const withAccess = await db
    .select({ email: sql<string>`lower(${users.email})` })
    .from(users)
    .where(
      or(
        eq(userIdText, userId),
        inArray(userIdText, db.select({ id: listMembers.userId }).from(listMembers).where(eq(listMembers.listId, listId))),
      ),
    );
  const skipped = new Set(withAccess.map((user) => user.email));
  const invited = emails.filter((email) => !skipped.has(email));
  if (invited.length === 0) {
    return 0;
  }

  const rows = await db
    .insert(listInvites)
    .values(invited.map((email) => ({ listId, email, invitedBy: userId })))
    .onConflictDoUpdate({
      target: [listInvites.listId, listInvites.email],
      set: { sentAt: sql`now()`, declinedAt: null, invitedBy: sql`excluded.invited_by` },
    })
    .returning({ id: listInvites.id });
  return rows.length;
}

// Sends an invite to one of the user's lists again, also when it was declined.
export async function resendInvite(userId: string, inviteId: string): Promise<void> {
  await db
    .update(listInvites)
    .set({ sentAt: sql`now()`, declinedAt: null })
    .where(and(eq(listInvites.id, inviteId), inArray(listInvites.listId, ownedLists(userId))));
}

export async function deleteInvite(userId: string, inviteId: string): Promise<void> {
  await db.delete(listInvites).where(and(eq(listInvites.id, inviteId), inArray(listInvites.listId, ownedLists(userId))));
}

// Takes away a member's access to one of the user's lists.
export async function deleteMember(userId: string, listId: string, memberId: string): Promise<void> {
  await db
    .delete(listMembers)
    .where(
      and(eq(listMembers.listId, listId), eq(listMembers.userId, memberId), inArray(listMembers.listId, ownedLists(userId))),
    );
}

// Joins the list of an invitation sent to the user's lower-case email address and uses the invitation up.
export async function acceptInvitation(user: { id: string; email: string }, inviteId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [invite] = await tx
      .delete(listInvites)
      .where(and(eq(listInvites.id, inviteId), eq(listInvites.email, user.email)))
      .returning({ listId: listInvites.listId });
    if (invite) {
      await tx.insert(listMembers).values({ listId: invite.listId, userId: user.id }).onConflictDoNothing();
    }
  });
}

// Declines an invitation sent to the lower-case email address, so the owner sees the reply.
export async function declineInvitation(email: string, inviteId: string): Promise<void> {
  await db
    .update(listInvites)
    .set({ declinedAt: sql`now()` })
    .where(and(eq(listInvites.id, inviteId), eq(listInvites.email, email)));
}

// Gives up the user's access to a list someone shared with them.
export async function deleteMembership(userId: string, listId: string): Promise<void> {
  await db.delete(listMembers).where(and(eq(listMembers.userId, userId), eq(listMembers.listId, listId)));
}
