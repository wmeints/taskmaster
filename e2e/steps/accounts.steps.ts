import { expect, type Page } from "@playwright/test"

import { Given, Then, When } from "./fixtures"

// Opens a page and waits until it has hydrated; a form submitted before that falls back to a plain GET.
async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" })
}

// Submits the filled-in sign-up form. Neon Auth limits how many accounts one address can create in a short
// time, and parallel scenarios hit that limit, so try again after a pause when the account isn't created.
async function submitSignUp(page: Page) {
  const attempts = 5
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = page.waitForResponse(
      (response) => response.request().method() === "POST" && !!response.request().headers()["next-action"],
    )
    await page.getByRole("button", { name: "Sign up" }).click()
    if ((await response).headers()["x-action-redirect"]) break
    if (attempt === attempts) throw new Error(`Sign-up failed ${attempts} times`)
    await page.waitForTimeout(attempt * 2_000)
  }
  await expect(page).toHaveURL(/\/today$/)
}

Given("{word} is on the landing page", async ({ people }, name: string) => {
  const { page } = await people.get(name)
  await open(page, "/")
})

When("{word} creates an account from the landing page", async ({ people }, name: string) => {
  const { page, email, password } = await people.get(name)
  await page.getByRole("textbox", { name: "Email address" }).first().fill(email)
  await page.getByRole("button", { name: "Create account" }).first().click()

  await expect(page).toHaveURL(/\/auth\/sign-up/)
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toHaveValue(email)
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(name)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await submitSignUp(page)
})

Given("{word} has an account", async ({ people }, name: string) => {
  const { page, email, password } = await people.get(name)
  await open(page, "/auth/sign-up")
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(name)
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await submitSignUp(page)
})

When("{word} signs out", async ({ people }, name: string) => {
  const { page } = await people.get(name)
  await page.getByRole("button", { name }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
})

When("{word} signs in", async ({ people }, name: string) => {
  const { page, email, password } = await people.get(name)
  await open(page, "/auth/sign-in")
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email)
  await page.getByLabel("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/today$/)
})

Then("{word} is signed in", async ({ people }, name: string) => {
  const { page, email } = await people.get(name)
  await page.getByRole("button", { name }).click()
  await expect(page.getByRole("menu")).toContainText(email)
  await page.keyboard.press("Escape")
})
