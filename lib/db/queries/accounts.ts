import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";

// Managed Auth stores users in the branch's neon_auth schema, so the same Postgres can read them.
export async function findUserCreatedAt(userId: string): Promise<Date | null> {
  const [user] = await db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, userId));
  return user?.createdAt ?? null;
}

// Proves the database answers; for the health check.
export async function pingDatabase(): Promise<{ now: Date; version: string }> {
  const { rows } = await db.execute<{ now: Date; version: string }>(sql`select now(), version()`);
  return rows[0];
}
