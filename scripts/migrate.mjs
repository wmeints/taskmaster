// Applies the SQL files in db/migrations that haven't run yet, in name order, each in a transaction.
// Usage: node --env-file-if-exists=.env.local scripts/migrate.mjs
import { readdir, readFile } from "node:fs/promises"
import pg from "pg"

const directory = new URL("../db/migrations/", import.meta.url)
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
})

await client.connect()
try {
  await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())")
  const { rows } = await client.query("select name from schema_migrations")
  const applied = new Set(rows.map((row) => row.name))
  const pending = (await readdir(directory)).filter((name) => name.endsWith(".sql") && !applied.has(name)).sort()

  for (const name of pending) {
    await client.query("begin")
    try {
      await client.query(await readFile(new URL(name, directory), "utf8"))
      await client.query("insert into schema_migrations (name) values ($1)", [name])
      await client.query("commit")
      console.log(`Applied ${name}`)
    } catch (error) {
      await client.query("rollback")
      throw error
    }
  }
  if (pending.length === 0) console.log("No pending migrations")
} finally {
  await client.end()
}
