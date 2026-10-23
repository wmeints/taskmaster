"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/auth/schemas";

type ActionResult = { error: string } | undefined;

export async function signUpWithEmail(values: SignUpValues): Promise<ActionResult> {
  // Never trust the client: re-validate with the same schema the form uses.
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await auth.signUp.email(parsed.data);
  if (error) {
    return { error: error.message || "Failed to create account" };
  }
  redirect("/today");
}

export async function signInWithEmail(values: SignInValues): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await auth.signIn.email(parsed.data);
  if (error) {
    return { error: error.message || "Failed to sign in" };
  }
  redirect("/today");
}

export async function signOut() {
  await auth.signOut();
  redirect("/");
}
