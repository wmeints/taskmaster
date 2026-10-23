import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { env } from "@/lib/env";

// Pooled connection string (-pooler) for app traffic; use DATABASE_URL_UNPOOLED for migrations.
export const pool = new Pool({ connectionString: withExplicitSslMode(env.postgres.databaseUrl) });

// Lets Vercel Fluid compute close idle clients before a function instance suspends.
attachDatabasePool(pool);

// pg treats prefer/require/verify-ca as verify-full today but warns they'll weaken in pg 9.
// Saying verify-full keeps today's certificate check and silences the warning.
function withExplicitSslMode(connectionString: string): string {
  const url = new URL(connectionString);
  if (["prefer", "require", "verify-ca"].includes(url.searchParams.get("sslmode") ?? "")) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}
