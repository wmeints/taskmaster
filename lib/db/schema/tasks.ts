import { relations } from "drizzle-orm";
import { date, foreignKey, index, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { lists } from "./lists";
import { subtasks } from "./subtasks";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    listId: uuid("list_id"),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    // Calendar date and time in the user's own time zone.
    dueDate: date("due_date", { mode: "string" }),
    dueTime: time("due_time"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Deleting a list keeps its tasks, without a list.
    foreignKey({ name: "tasks_list_id_fkey", columns: [table.listId], foreignColumns: [lists.id] }).onDelete("set null"),
    index("tasks_user_id_completed_at_idx").on(table.userId, table.completedAt),
    index("tasks_list_id_idx").on(table.listId),
  ],
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, { fields: [tasks.listId], references: [lists.id] }),
  subtasks: many(subtasks),
}));
