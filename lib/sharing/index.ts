import "server-only";
import {
  acceptInvitation,
  declineInvitation,
  findInvitations,
  findMembers,
  findSentInvites,
  insertInvites,
} from "@/lib/db/queries";
import type { ListAccess, Sharing } from "./types";

export type { Invitation, ListAccess, Member, SentInvite, Sharing } from "./types";

export {
  deleteInvite as revokeInvite,
  deleteMember as removeMember,
  deleteMembership as leaveList,
  resendInvite,
} from "@/lib/db/queries";

type User = { id: string; email: string };

// Who has access to the user's lists, and the invitations waiting for the user's reply.
export async function getSharing(user: User): Promise<Sharing> {
  const [members, invites, invitations] = await Promise.all([
    findMembers(user.id),
    findSentInvites(user.id),
    findInvitations(user.email.toLowerCase()),
  ]);

  const lists: Record<string, ListAccess> = {};
  const accessTo = (listId: string) => (lists[listId] ??= { members: [], invites: [] });
  for (const { listId, ...member } of members) accessTo(listId).members.push(member);
  for (const { listId, ...invite } of invites) accessTo(listId).invites.push(invite);

  return { invitations, lists };
}

// Invites lower-case addresses to a list the user owns, skipping the owner and people who already joined.
// Inviting an address again sends the invite again.
export async function inviteToList(userId: string, listId: string, emails: string[]): Promise<{ error: string } | undefined> {
  if ((await insertInvites(userId, listId, emails)) === 0) {
    return { error: "Everyone you entered already has access" };
  }
}

// Accepts or declines an invitation sent to the user's email address.
export async function respondToInvitation(user: User, inviteId: string, { accept }: { accept: boolean }): Promise<void> {
  const email = user.email.toLowerCase();
  if (accept) {
    await acceptInvitation({ id: user.id, email }, inviteId);
  } else {
    await declineInvitation(email, inviteId);
  }
}
