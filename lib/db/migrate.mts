// Applies the Drizzle migrations in db/migrations that haven't run yet. Run it with `pnpm db:migrate`;
// Node runs this file directly, so it only imports packages and Node built-ins.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql, type SQL } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

const migrationsFolder = path.join(import.meta.dirname, "../../db/migrations");

// The SQL files the old runner applied; together they create exactly the schema of Drizzle's baseline.
const legacyMigrations = ["001_tasks.sql", "002_sharing.sql"];

type Database = PgDatabase<PgQueryResultHKT>;

export async function migrateDatabase<D extends Database>(
  db: D,
  migrate: (db: D, config: { migrationsFolder: string }) => Promise<void>,
): Promise<void> {
  await adoptLegacyDatabase(db);
  await migrate(db, { migrationsFolder });
}

// A database the old runner migrated already has the baseline's tables. Recording the baseline as applied,
// the way Drizzle's migrator does, lets Drizzle take over without creating them again.
async function adoptLegacyDatabase(db: Database): Promise<void> {
  const [{ legacy }] = await rows<{ legacy: boolean }>(
    db,
    sql`select to_regclass('public.schema_migrations') is not null as legacy`,
  );
  if (!legacy) {
    return;
  }

  const applied = await rows<{ name: string }>(db, sql`select name from public.schema_migrations`);
  const missing = legacyMigrations.filter((name) => !applied.some((row) => row.name === name));
  if (missing.length > 0) {
    throw new Error(`Apply ${missing.join(", ")} with the old runner before switching to Drizzle migrations`);
  }

  const [baseline] = JSON.parse(readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf8")).entries;
  const hash = createHash("sha256")
    .update(readFileSync(path.join(migrationsFolder, `${baseline.tag}.sql`)).toString())
    .digest("hex");

  await db.transaction(async (tx) => {
    await tx.execute(sql`create schema if not exists drizzle`);
    await tx.execute(
      sql`create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)`,
    );
    await tx.execute(sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${baseline.when})`);
    await tx.execute(sql`drop table public.schema_migrations`);
  });
}

// Every driver this runs on (node-postgres, PGlite in tests) answers execute() with { rows }.
async function rows<T>(db: Database, query: SQL): Promise<T[]> {
  return ((await db.execute(query)) as { rows: T[] }).rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  // Migrations change the schema, so they need the direct connection rather than the pooled one.
  const db = drizzle(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
  try {
    await migrateDatabase(db, migrate);
    console.log("Database is up to date");
  } finally {
    await db.$client.end();
  }
}
