import { foreignKey, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { lists } from "./lists";

// Invitations by email to join a list, waiting for a reply.
export const listInvites = pgTable(
  "list_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id").notNull(),
    // Lower case; matched against the invitee's sign-in email.
    email: text("email").notNull(),
    invitedBy: text("invited_by").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    // Set when the invitee declines; resending clears it.
    declinedAt: timestamp("declined_at", { withTimezone: true }),
  },
  (table) => [
    foreignKey({ name: "list_invites_list_id_fkey", columns: [table.listId], foreignColumns: [lists.id] }).onDelete("cascade"),
    unique("list_invites_list_id_email_key").on(table.listId, table.email),
    index("list_invites_email_idx").on(table.email),
  ],
);
