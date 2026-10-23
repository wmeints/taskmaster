"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

type FormState = { error: string } | null;

export async function signUpWithEmail(_prev: FormState, formData: FormData) {
  const { error } = await auth.signUp.email({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return { error: error.message || "Failed to create account" };
  }
  redirect("/account");
}

export async function signInWithEmail(_prev: FormState, formData: FormData) {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return { error: error.message || "Failed to sign in" };
  }
  redirect("/account");
}

export async function signOut() {
  await auth.signOut();
  redirect("/");
}
