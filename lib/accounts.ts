import "server-only";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";

export type Account = {
  name: string;
  email: string;
  createdAt: Date | null;
};

// Returns the signed-in user's account, or null when nobody is signed in.
export async function getCurrentAccount(): Promise<Account | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return null;
  }

  const { name, email } = session.user;
  return { name, email, createdAt: await findCreatedAt(session.user.id) };
}

// Managed Auth stores users in the branch's neon_auth schema, so the same Postgres can read them.
async function findCreatedAt(userId: string): Promise<Date | null> {
  const { rows } = await pool.query<{ created_at: Date }>(
    'select "createdAt" as created_at from neon_auth."user" where id = $1',
    [userId],
  );
  return rows[0]?.created_at ?? null;
}
