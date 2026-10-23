import { connection } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  await connection();
  const { rows } = await pool.query<{ now: Date; version: string }>(
    "select now(), version()",
  );
  return Response.json({ ok: true, database: rows[0] });
}
