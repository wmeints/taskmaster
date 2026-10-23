import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ListColor } from "@/lib/tasks/types";
import { tasks } from "./tasks";

// Users live in neon_auth."user"; user_id holds their id as text.
export const lists = pgTable(
  "lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color").$type<ListColor>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("lists_user_id_idx").on(table.userId)],
);

export const listsRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));
