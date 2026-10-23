import { foreignKey, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { lists } from "./lists";

// The people who joined a list someone shared with them.
export const listMembers = pgTable(
  "list_members",
  {
    listId: uuid("list_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ name: "list_members_pkey", columns: [table.listId, table.userId] }),
    foreignKey({ name: "list_members_list_id_fkey", columns: [table.listId], foreignColumns: [lists.id] }).onDelete("cascade"),
    index("list_members_user_id_idx").on(table.userId),
  ],
);
