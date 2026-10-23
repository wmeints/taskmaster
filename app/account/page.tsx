import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { signOut } from "../auth/actions";

export default function AccountPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <Suspense fallback={<p>Loading account…</p>}>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Managed Auth stores users in the branch's neon_auth schema, so the same Postgres can read them.
  const { rows } = await pool.query<{ created_at: Date }>(
    'select "createdAt" as created_at from neon_auth."user" where id = $1',
    [session.user.id],
  );

  return (
    <>
      <h1 className="text-2xl font-semibold">Signed in as {session.user.name}</h1>
      <p data-testid="email">{session.user.email}</p>
      <p data-testid="db-created-at">
        Account created (from Postgres): {rows[0]?.created_at.toISOString() ?? "not found"}
      </p>
      <form action={signOut}>
        <button type="submit" className="rounded-md border px-3 py-2">
          Sign out
        </button>
      </form>
    </>
  );
}
