import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">Taskmaster</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <SessionStatus />
      </Suspense>
    </main>
  );
}

async function SessionStatus() {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  const { data: session } = await auth.getSession();

  if (session?.user) {
    return (
      <Link href="/account" className="underline">
        Signed in as {session.user.name}
      </Link>
    );
  }

  return (
    <div className="flex gap-4">
      <Link href="/auth/sign-in" className="underline">Sign in</Link>
      <Link href="/auth/sign-up" className="underline">Sign up</Link>
    </div>
  );
}
