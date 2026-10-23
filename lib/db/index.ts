import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Pooled connection string (-pooler) for app traffic; use DATABASE_URL_UNPOOLED for migrations.
const pool = new Pool({ connectionString: withExplicitSslMode(env.postgres.databaseUrl) });

// Lets Vercel Fluid compute close idle clients before a function instance suspends.
attachDatabasePool(pool);

// Only lib/db/queries should import this; everything else goes through those queries.
export const db = drizzle({ client: pool, schema });

// pg treats prefer/require/verify-ca as verify-full today but warns they'll weaken in pg 9.
// Saying verify-full keeps today's certificate check and silences the warning.
function withExplicitSslMode(connectionString: string): string {
  const url = new URL(connectionString);
  if (["prefer", "require", "verify-ca"].includes(url.searchParams.get("sslmode") ?? "")) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}
