import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tasks } from "./tasks";

export const subtasks = pgTable(
  "subtasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id").notNull(),
    title: text("title").notNull(),
    done: boolean("done").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({ name: "subtasks_task_id_fkey", columns: [table.taskId], foreignColumns: [tasks.id] }).onDelete("cascade"),
    index("subtasks_task_id_idx").on(table.taskId),
  ],
);

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
}));
