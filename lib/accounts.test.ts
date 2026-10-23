import { beforeEach, describe, expect, it, vi } from "vitest"

const { auth, pool } = vi.hoisted(() => ({
  auth: { getSession: vi.fn() },
  pool: { query: vi.fn() },
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/server", () => ({ auth }))
vi.mock("@/lib/db", () => ({ pool }))

import { getCurrentAccount, getCurrentUser } from "./accounts"

const user = { id: "user-1", name: "Ada", email: "ada@example.com" }

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getCurrentAccount", () => {
  it("returns null when nobody is signed in", async () => {
    auth.getSession.mockResolvedValue({ data: null })

    await expect(getCurrentAccount()).resolves.toBeNull()
    expect(pool.query).not.toHaveBeenCalled()
  })

  it("returns the signed-in user with the creation date from Postgres", async () => {
    const createdAt = new Date("2026-10-01T09:30:00Z")
    auth.getSession.mockResolvedValue({ data: { user } })
    pool.query.mockResolvedValue({ rows: [{ created_at: createdAt }] })

    await expect(getCurrentAccount()).resolves.toEqual({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      createdAt,
    })
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["user-1"])
  })

  it("leaves the creation date empty when the user row is missing", async () => {
    auth.getSession.mockResolvedValue({ data: { user } })
    pool.query.mockResolvedValue({ rows: [] })

    await expect(getCurrentAccount()).resolves.toMatchObject({ createdAt: null })
  })
})

describe("getCurrentUser", () => {
  it("returns null when nobody is signed in", async () => {
    auth.getSession.mockResolvedValue({ data: null })

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it("returns the signed-in user's id and name without querying Postgres", async () => {
    auth.getSession.mockResolvedValue({ data: { user } })

    await expect(getCurrentUser()).resolves.toEqual({ id: "user-1", name: "Ada" })
    expect(pool.query).not.toHaveBeenCalled()
  })
})
