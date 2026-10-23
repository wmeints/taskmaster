import { connection } from "next/server";
import { pingDatabase } from "@/lib/db/queries";

export async function GET() {
  await connection();
  return Response.json({ ok: true, database: await pingDatabase() });
}
