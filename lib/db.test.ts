import { beforeEach, describe, expect, it, vi } from "vitest"

const { Pool, env } = vi.hoisted(() => ({
  Pool: vi.fn(),
  env: { postgres: { databaseUrl: "" } },
}))

vi.mock("server-only", () => ({}))
vi.mock("pg", () => ({ Pool }))
vi.mock("@vercel/functions", () => ({ attachDatabasePool: vi.fn() }))
vi.mock("@/lib/env", () => ({ env }))

async function connectionStringFor(databaseUrl: string) {
  env.postgres.databaseUrl = databaseUrl
  vi.resetModules()
  await import("./db")
  return new URL(Pool.mock.calls[0][0].connectionString)
}

beforeEach(() => {
  Pool.mockClear()
})

describe("pool", () => {
  it("spells out the certificate check pg already does for sslmode=require", async () => {
    const url = await connectionStringFor("postgresql://u:p@host/db?sslmode=require&channel_binding=require")

    expect(url.searchParams.get("sslmode")).toBe("verify-full")
    expect(url.searchParams.get("channel_binding")).toBe("require")
  })

  it("leaves other SSL modes alone", async () => {
    const url = await connectionStringFor("postgresql://u:p@host/db?sslmode=disable")

    expect(url.searchParams.get("sslmode")).toBe("disable")
  })
})
