import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, redirect } = vi.hoisted(() => ({
  auth: {
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
  redirect: vi.fn(),
}))

vi.mock("@/lib/auth/server", () => ({ auth }))
vi.mock("next/navigation", () => ({ redirect }))

import { signInWithEmail, signUpWithEmail } from "./actions"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("signUpWithEmail", () => {
  const values = { name: "Ada", email: "ada@example.com", password: "correct horse" }

  it("creates the account and redirects to today", async () => {
    auth.signUp.email.mockResolvedValue({ error: null })

    await signUpWithEmail(values)

    expect(auth.signUp.email).toHaveBeenCalledWith(values)
    expect(redirect).toHaveBeenCalledWith("/today")
  })

  it("rejects invalid input without calling the auth service", async () => {
    const result = await signUpWithEmail({ ...values, password: "short" })

    expect(result).toEqual({ error: "Use at least 8 characters" })
    expect(auth.signUp.email).not.toHaveBeenCalled()
  })

  it("returns the auth service error", async () => {
    auth.signUp.email.mockResolvedValue({ error: { message: "Email already in use" } })

    const result = await signUpWithEmail(values)

    expect(result).toEqual({ error: "Email already in use" })
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe("signInWithEmail", () => {
  const values = { email: "ada@example.com", password: "secret" }

  it("signs in and redirects to today", async () => {
    auth.signIn.email.mockResolvedValue({ error: null })

    await signInWithEmail(values)

    expect(auth.signIn.email).toHaveBeenCalledWith(values)
    expect(redirect).toHaveBeenCalledWith("/today")
  })

  it("rejects invalid input without calling the auth service", async () => {
    const result = await signInWithEmail({ ...values, email: "nope" })

    expect(result).toEqual({ error: "Enter a valid email address" })
    expect(auth.signIn.email).not.toHaveBeenCalled()
  })

  it("falls back to a generic message when the auth service gives none", async () => {
    auth.signIn.email.mockResolvedValue({ error: { message: "" } })

    const result = await signInWithEmail(values)

    expect(result).toEqual({ error: "Failed to sign in" })
  })
})
