import { expect, type Page } from "@playwright/test"

import { Given, saving, Then, When } from "./fixtures"

function listLink(page: Page, list: string) {
  return page.getByRole("navigation", { name: "Lists" }).getByRole("link", { name: list })
}

async function createList(page: Page, list: string) {
  await page.getByRole("button", { name: "New list" }).click()
  await saving(page, async () => {
    await page.getByRole("textbox", { name: "List name" }).fill(list)
    await page.keyboard.press("Enter")
  })
  await expect(page.getByRole("heading", { level: 1, name: list })).toBeVisible()
}

When("{word} creates the list {string}", async ({ people }, name: string, list: string) => {
  const { page } = await people.get(name)
  await createList(page, list)
})

Given("{word} has a list {string} with the task {string}", async ({ people }, name: string, list: string, title: string) => {
  const { page } = await people.get(name)
  await createList(page, list)
  await saving(page, async () => {
    await page.getByRole("textbox", { name: "New task", exact: true }).fill(title)
    await page.keyboard.press("Enter")
  })
  await expect(page.getByRole("main").getByRole("button", { name: title, exact: true })).toBeVisible()
})

When("{word} opens the list {string}", async ({ people }, name: string, list: string) => {
  const { page } = await people.get(name)
  await listLink(page, list).click()
  await expect(page.getByRole("heading", { level: 1, name: list })).toBeVisible()
})

Then("{word} sees {int} open task(s) in the list {string}", async ({ people }, name: string, count: number, list: string) => {
  const { page } = await people.get(name)
  await expect(listLink(page, list)).toContainText(String(count))
})
