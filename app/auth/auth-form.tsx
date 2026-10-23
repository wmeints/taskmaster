"use client";

import { useActionState } from "react";
import Link from "next/link";

type FormState = { error: string } | null;

export function AuthForm({
  mode,
  action,
  defaultEmail,
}: {
  mode: "sign-in" | "sign-up";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaultEmail?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const isSignUp = mode === "sign-up";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">
          {isSignUp ? "Create an account" : "Sign in"}
        </h1>
        {isSignUp && (
          <input name="name" placeholder="Name" required className="rounded-md border px-3 py-2" />
        )}
        <input name="email" type="email" placeholder="Email" defaultValue={defaultEmail} required className="rounded-md border px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required minLength={8} className="rounded-md border px-3 py-2" />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={isPending} className="rounded-md bg-foreground px-3 py-2 text-background disabled:opacity-50">
          {isPending ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
        </button>
        <Link href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"} className="text-sm underline">
          {isSignUp ? "Already have an account? Sign in" : "No account yet? Sign up"}
        </Link>
      </form>
    </main>
  );
}
