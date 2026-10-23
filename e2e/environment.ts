import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { parseEnv } from "node:util"

// What the app needs to run against the end-to-end test branch.
const required = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "NEON_BRANCH", "NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET"]

// Variables that must differ from .env.local, so the tests never sign up users in a branch people use.
const isolated = ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "NEON_BRANCH", "NEON_AUTH_BASE_URL"]

// Reads the end-to-end test settings from .env.e2e in dir. Throws when a setting is missing or when the
// file points at the same Neon branch, database or auth server as .env.local.
export function loadE2eEnvironment(dir: string): Record<string, string> {
  const env = read(path.join(dir, ".env.e2e"))
  if (!env) {
    throw new Error("Create .env.e2e with the settings of a Neon branch for end-to-end tests (see README.md)")
  }

  const missing = required.filter((name) => !env[name])
  if (missing.length > 0) {
    throw new Error(`.env.e2e is missing ${missing.join(", ")}`)
  }

  const local = read(path.join(dir, ".env.local")) ?? {}
  const shared = isolated.filter((name) => local[name] === env[name])
  if (shared.length > 0) {
    throw new Error(`.env.e2e uses the same ${shared.join(", ")} as .env.local; point it at a separate test branch`)
  }

  return env
}

function read(file: string): Record<string, string> | null {
  if (!existsSync(file)) return null
  return parseEnv(readFileSync(file, "utf8")) as Record<string, string>
}
