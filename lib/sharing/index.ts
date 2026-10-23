import "server-only";
import { pool } from "@/lib/db";
import type { ListAccess, Sharing } from "./types";

export type { Invitation, ListAccess, Member, SentInvite, Sharing } from "./types";

// Only the owner of a list (the user in $1) decides who has access to it.
const ownedLists = "select id from lists where user_id = $1";

type User = { id: string; email: string };

// Who has access to the user's lists, and the invitations waiting for the user's reply.
export async function getSharing(user: User): Promise<Sharing> {
  const [members, invites, invitations] = await Promise.all([
    pool.query<{ list_id: string; id: string; name: string; email: string }>(
      `select m.list_id, u.id, u.name, u.email
       from list_members m
       join lists l on l.id = m.list_id
       join neon_auth."user" u on u.id::text = m.user_id
       where l.user_id = $1
       order by m.created_at`,
      [user.id],
    ),
    pool.query<{ list_id: string; id: string; email: string; declined: boolean }>(
      `select i.list_id, i.id, i.email, i.declined_at is not null as declined
       from list_invites i
       join lists l on l.id = i.list_id
       where l.user_id = $1
       order by i.sent_at`,
      [user.id],
    ),
    pool.query<{ id: string; list_name: string; invited_by: string }>(
      `select i.id, l.name as list_name, coalesce(u.name, '') as invited_by
       from list_invites i
       join lists l on l.id = i.list_id
       left join neon_auth."user" u on u.id::text = i.invited_by
       where i.email = $1 and i.declined_at is null
       order by i.sent_at`,
      [user.email.toLowerCase()],
    ),
  ]);

  const lists: Record<string, ListAccess> = {};
  const accessTo = (listId: string) => (lists[listId] ??= { members: [], invites: [] });
  for (const { list_id, ...member } of members.rows) accessTo(list_id).members.push(member);
  for (const { list_id, ...invite } of invites.rows) accessTo(list_id).invites.push(invite);

  return {
    invitations: invitations.rows.map((row) => ({ id: row.id, listName: row.list_name, invitedBy: row.invited_by })),
    lists,
  };
}

// Invites lower-case addresses to a list the user owns, skipping the owner and people who already joined.
// Inviting an address again sends the invite again.
export async function inviteToList(userId: string, listId: string, emails: string[]): Promise<{ error: string } | undefined> {
  const { rows } = await pool.query<{ invited: number }>(
    `with invited as (
       insert into list_invites (list_id, email, invited_by)
       select l.id, e.email, $1
       from lists l, unnest($3::text[]) as e (email)
       where l.id = $2 and l.user_id = $1
         and e.email not in (
           select lower(u.email) from neon_auth."user" u
           where u.id::text = l.user_id or u.id::text in (select user_id from list_members where list_id = l.id)
         )
       on conflict (list_id, email) do update set sent_at = now(), declined_at = null, invited_by = excluded.invited_by
       returning id
     )
     select count(*)::int as invited from invited`,
    [userId, listId, emails],
  );
  if (rows[0].invited === 0) {
    return { error: "Everyone you entered already has access" };
  }
}

// Sends an invite again, also when it was declined.
export async function resendInvite(userId: string, inviteId: string): Promise<void> {
  await pool.query(
    `update list_invites set sent_at = now(), declined_at = null where id = $2 and list_id in (${ownedLists})`,
    [userId, inviteId],
  );
}

export async function revokeInvite(userId: string, inviteId: string): Promise<void> {
  await pool.query(`delete from list_invites where id = $2 and list_id in (${ownedLists})`, [userId, inviteId]);
}

// Takes away a member's access. The tasks they added stay in the list.
export async function removeMember(userId: string, listId: string, memberId: string): Promise<void> {
  await pool.query(`delete from list_members where list_id = $2 and user_id = $3 and list_id in (${ownedLists})`, [
    userId,
    listId,
    memberId,
  ]);
}

// Accepts or declines an invitation sent to the user's email address.
export async function respondToInvitation(user: User, inviteId: string, { accept }: { accept: boolean }): Promise<void> {
  const email = user.email.toLowerCase();
  if (accept) {
    await pool.query(
      `with invite as (delete from list_invites where id = $2 and email = $3 returning list_id)
       insert into list_members (list_id, user_id) select list_id, $1 from invite
       on conflict do nothing`,
      [user.id, inviteId, email],
    );
  } else {
    await pool.query("update list_invites set declined_at = now() where id = $1 and email = $2", [inviteId, email]);
  }
}

// Gives up the user's access to a list someone shared with them.
export async function leaveList(userId: string, listId: string): Promise<void> {
  await pool.query("delete from list_members where user_id = $1 and list_id = $2", [userId, listId]);
}
