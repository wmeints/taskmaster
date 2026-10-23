import { randomUUID } from "node:crypto"

import type { Browser, BrowserContextOptions, Page } from "@playwright/test"
import { test as base, createBdd } from "playwright-bdd"

// Someone using the app in a scenario, with a browser of their own.
export type Person = { name: string; email: string; password: string; page: Page }

// The people in a scenario, by name. Each gets a fresh browser context and an email address no other test
// run uses, so scenarios can run in parallel against the same branch.
class People {
  readonly #people = new Map<string, Person>()

  constructor(
    private readonly browser: Browser,
    private readonly options: BrowserContextOptions,
  ) {}

  async get(name: string): Promise<Person> {
    let person = this.#people.get(name)
    if (!person) {
      const context = await this.browser.newContext(this.options)
      person = {
        name,
        email: `${name.toLowerCase()}-${randomUUID()}@example.com`,
        password: `e2e-${randomUUID()}`,
        page: await context.newPage(),
      }
      this.#people.set(name, person)
    }
    return person
  }

  async close() {
    await Promise.all([...this.#people.values()].map((person) => person.page.context().close()))
  }
}

export const test = base.extend<{ people: People }>({
  people: async ({ browser, contextOptions, baseURL }, use) => {
    const people = new People(browser, { ...contextOptions, baseURL })
    await use(people)
    await people.close()
  },
})

export const { Given, When, Then } = createBdd(test)

// Runs a user interaction that calls a server action and waits until the server has answered, so the
// change is saved before the next step, even when the UI already shows it optimistically. Don't wait for
// the response body: it streams the refreshed page and can stay open.
export async function saving(page: Page, interaction: () => Promise<void>) {
  const response = page.waitForResponse(
    (response) => response.request().method() === "POST" && !!response.request().headers()["next-action"],
  )
  await interaction()
  await response
}
