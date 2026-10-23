import { pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Neon Auth owns this table and its migrations; the app only reads it. schema/index.ts leaves it out, which
// keeps it out of generated migrations.
export const neonAuth = pgSchema("neon_auth");

export const users = neonAuth.table("user", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
});
