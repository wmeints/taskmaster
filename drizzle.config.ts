import { defineConfig } from "drizzle-kit";

// Migrations change the schema, so they use the direct connection; PgBouncer's pooled one can't hold session state.
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema/index.ts",
  out: "./db/migrations",
  // neon_auth belongs to Neon Auth, which migrates it; keep push and pull away from it too.
  schemaFilter: ["public"],
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
});
