import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth } = vi.hoisted(() => ({
  auth: { getSession: vi.fn() },
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/server", () => ({ auth }))
vi.mock("@/lib/db", () => import("@/lib/db/testing"))

import { db, resetDatabase } from "@/lib/db/testing"
import { users } from "@/lib/db/schema/users"
import { getCurrentAccount, getCurrentUser } from "./accounts"

const user = { id: "6a0c1c3e-1111-4111-8111-111111111111", name: "Ada", email: "ada@example.com" }

beforeEach(async () => {
  vi.clearAllMocks()
  await resetDatabase()
})

describe("getCurrentAccount", () => {
  it("returns null when nobody is signed in", async () => {
    auth.getSession.mockResolvedValue({ data: null })

    await expect(getCurrentAccount()).resolves.toBeNull()
  })

  it("returns the signed-in user with the creation date from Postgres", async () => {
    const createdAt = new Date("2026-10-01T09:30:00Z")
    await db.insert(users).values({ ...user, createdAt })
    auth.getSession.mockResolvedValue({ data: { user } })

    await expect(getCurrentAccount()).resolves.toEqual({ ...user, createdAt })
  })

  it("leaves the creation date empty when the user row is missing", async () => {
    auth.getSession.mockResolvedValue({ data: { user } })

    await expect(getCurrentAccount()).resolves.toMatchObject({ createdAt: null })
  })
})

describe("getCurrentUser", () => {
  it("returns null when nobody is signed in", async () => {
    auth.getSession.mockResolvedValue({ data: null })

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it("returns the signed-in user's id, name and email", async () => {
    auth.getSession.mockResolvedValue({ data: { user } })

    await expect(getCurrentUser()).resolves.toEqual(user)
  })
})
