import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { env } from "@/lib/env";

// Pooled connection string (-pooler) for app traffic; use DATABASE_URL_UNPOOLED for migrations.
export const pool = new Pool({ connectionString: env.postgres.databaseUrl });

// Lets Vercel Fluid compute close idle clients before a function instance suspends.
attachDatabasePool(pool);
