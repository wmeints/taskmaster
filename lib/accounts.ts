import "server-only";
import { auth } from "@/lib/auth/server";
import { findUserCreatedAt } from "@/lib/db/queries";

export type Account = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
};

export type User = { id: string; name: string; email: string };

// Returns who is signed in, or null; cheaper than getCurrentAccount because it skips Postgres.
export async function getCurrentUser(): Promise<User | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return null;
  }

  const { id, name, email } = session.user;
  return { id, name, email };
}

// Returns the signed-in user's account, or null when nobody is signed in.
export async function getCurrentAccount(): Promise<Account | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return null;
  }

  const { id, name, email } = session.user;
  return { id, name, email, createdAt: await findUserCreatedAt(id) };
}
