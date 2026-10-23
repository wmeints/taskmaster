import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { loadE2eEnvironment } from "./environment"

const testBranch = [
  "DATABASE_URL=postgresql://e2e-pooler.example/neondb",
  "DATABASE_URL_UNPOOLED=postgresql://e2e.example/neondb",
  "NEON_BRANCH=e2e",
  "NEON_AUTH_BASE_URL=https://e2e-auth.example",
  "NEON_AUTH_COOKIE_SECRET=secret",
].join("\n")

const devBranch = [
  "DATABASE_URL=postgresql://dev-pooler.example/neondb",
  "DATABASE_URL_UNPOOLED=postgresql://dev.example/neondb",
  "NEON_BRANCH=production",
  "NEON_AUTH_BASE_URL=https://dev-auth.example",
].join("\n")

function project(files: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "e2e-env-"))
  for (const [name, contents] of Object.entries(files)) writeFileSync(path.join(dir, name), contents)
  return dir
}

describe("loadE2eEnvironment", () => {
  it("returns the variables in .env.e2e", () => {
    const env = loadE2eEnvironment(project({ ".env.e2e": testBranch, ".env.local": devBranch }))

    expect(env).toMatchObject({
      DATABASE_URL: "postgresql://e2e-pooler.example/neondb",
      NEON_BRANCH: "e2e",
      NEON_AUTH_COOKIE_SECRET: "secret",
    })
  })

  it("works without .env.local", () => {
    expect(loadE2eEnvironment(project({ ".env.e2e": testBranch })).NEON_BRANCH).toBe("e2e")
  })

  it("fails when .env.e2e is missing", () => {
    expect(() => loadE2eEnvironment(project({}))).toThrow(/Create \.env\.e2e/)
  })

  it("fails when a required variable is missing", () => {
    const dir = project({ ".env.e2e": testBranch.replace(/^NEON_AUTH_COOKIE_SECRET=.*$/m, "") })

    expect(() => loadE2eEnvironment(dir)).toThrow(/NEON_AUTH_COOKIE_SECRET/)
  })

  it("refuses the branch .env.local uses", () => {
    const dir = project({ ".env.e2e": testBranch.replace("NEON_BRANCH=e2e", "NEON_BRANCH=production"), ".env.local": devBranch })

    expect(() => loadE2eEnvironment(dir)).toThrow(/NEON_BRANCH/)
  })

  it("refuses a database or auth server .env.local uses", () => {
    const dir = project({
      ".env.e2e": testBranch.replace("https://e2e-auth.example", "https://dev-auth.example"),
      ".env.local": devBranch,
    })

    expect(() => loadE2eEnvironment(dir)).toThrow(/NEON_AUTH_BASE_URL/)
  })
})
