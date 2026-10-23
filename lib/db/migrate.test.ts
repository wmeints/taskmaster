import { readFileSync } from "node:fs"
import path from "node:path"
import { PGlite } from "@electric-sql/pglite"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { describe, expect, it } from "vitest"
import { migrateDatabase } from "./migrate.mjs"

const baseline = readFileSync(path.join(import.meta.dirname, "../../db/migrations/0000_baseline.sql"), "utf8")

async function tables(db: ReturnType<typeof drizzle>) {
  const { rows } = await db.execute<{ name: string }>(
    sql`select table_schema || '.' || table_name as name from information_schema.tables
        where table_schema in ('public', 'drizzle') order by name`,
  )
  return rows.map((row) => row.name)
}

describe("migrateDatabase", () => {
  it("creates the schema in an empty database", async () => {
    const db = drizzle({ client: new PGlite() })

    await migrateDatabase(db, migrate)

    expect(await tables(db)).toEqual([
      "drizzle.__drizzle_migrations",
      "public.list_invites",
      "public.list_members",
      "public.lists",
      "public.subtasks",
      "public.tasks",
    ])
  })

  it("can run again without changing anything", async () => {
    const db = drizzle({ client: new PGlite() })
    await migrateDatabase(db, migrate)

    await expect(migrateDatabase(db, migrate)).resolves.toBeUndefined()
  })

  it("takes over a database migrated by the old SQL runner, keeping its data", async () => {
    const client = new PGlite()
    const db = drizzle({ client })
    // The old migrations created the same schema as the baseline and recorded themselves here.
    await client.exec(baseline.replaceAll("--> statement-breakpoint", ""))
    await client.exec(`
      create table schema_migrations (name text primary key, applied_at timestamptz not null default now());
      insert into schema_migrations (name) values ('001_tasks.sql'), ('002_sharing.sql');
      insert into lists (user_id, name, color) values ('user-1', 'Website relaunch', 'blue');
    `)

    await migrateDatabase(db, migrate)

    expect(await tables(db)).not.toContain("public.schema_migrations")
    const { rows } = await db.execute<{ name: string }>(sql`select name from lists`)
    expect(rows).toEqual([{ name: "Website relaunch" }])
  })

  it("refuses to take over a database the old runner only partly migrated", async () => {
    const client = new PGlite()
    await client.exec(`
      create table schema_migrations (name text primary key, applied_at timestamptz not null default now());
      insert into schema_migrations (name) values ('001_tasks.sql');
    `)

    await expect(migrateDatabase(drizzle({ client }), migrate)).rejects.toThrow(/002_sharing\.sql/)
  })
})
