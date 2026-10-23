import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

// An in-memory Postgres with the app's migrations applied, standing in for "@/lib/db" in unit tests:
//
//   vi.mock("@/lib/db", () => import("@/lib/db/testing"))
//
// Each test file gets its own database; call resetDatabase() in beforeEach to start every test empty.

const client = new PGlite();

export const db = drizzle({ client, schema });

// Neon Auth creates this table on a real branch; tests need a stand-in to join against.
await client.exec(`
  create schema neon_auth;
  create table neon_auth."user" (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    "createdAt" timestamptz not null default current_timestamp
  );
`);
await migrate(db, { migrationsFolder: path.join(import.meta.dirname, "../../db/migrations") });

export async function resetDatabase(): Promise<void> {
  await db.execute(sql`truncate lists, tasks, subtasks, list_members, list_invites, neon_auth."user" cascade`);
}
