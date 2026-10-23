import { defineConfig, devices } from "@playwright/test"
import { defineBddConfig } from "playwright-bdd"

import { loadE2eEnvironment } from "./e2e/environment"

// The tests sign up real users, so they run against their own Neon branch, never the one in .env.local.
const env = loadE2eEnvironment(__dirname)
Object.assign(process.env, env)

const port = 3100
const baseURL = `http://localhost:${port}`

// Turns the feature files into Playwright tests that run the matching steps.
const testDir = defineBddConfig({
  features: "e2e/features/*.feature",
  steps: "e2e/steps/*.ts",
})

export default defineConfig({
  testDir,
  // Leaves room for backing off when Neon Auth rate-limits sign-ups.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Next.js recommends testing the production build. The test branch gets the latest migrations first.
  webServer: {
    command: `pnpm db:migrate && pnpm build && pnpm start --port ${port}`,
    url: `${baseURL}/api/health`,
    env,
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60_000,
  },
})
