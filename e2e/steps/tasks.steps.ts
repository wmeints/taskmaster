import { expect } from "@playwright/test"

import { saving, Then, When } from "./fixtures"

Then("{word} sees the {string} view", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible()
})

When("{word} reloads the page", async ({ people }, name: string) => {
  const { page } = await people.get(name)
  await page.reload()
})

When("{word} adds the task {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await saving(page, async () => {
    await page.getByRole("textbox", { name: "New task", exact: true }).fill(title)
    await page.keyboard.press("Enter")
  })
  await expect(page.getByRole("main").getByRole("button", { name: title, exact: true })).toBeVisible()
})

When("{word} opens the task {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await page.getByRole("main").getByRole("button", { name: title, exact: true }).click()
  await expect(page.getByRole("complementary", { name: "Task details" })).toBeVisible()
})

When("{word} adds the subtask {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  const details = page.getByRole("complementary", { name: "Task details" })
  await saving(page, async () => {
    await details.getByRole("textbox", { name: "New subtask" }).fill(title)
    await page.keyboard.press("Enter")
  })
  await expect(details.getByText(title, { exact: true })).toBeVisible()
})

When("{word} ticks off the subtask {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  const details = page.getByRole("complementary", { name: "Task details" })
  await saving(page, () => details.getByRole("checkbox", { name: title, exact: true }).click())
})

Then("{word} sees {int} of {int} subtasks done", async ({ people }, name: string, done: number, total: number) => {
  const { page } = await people.get(name)
  const details = page.getByRole("complementary", { name: "Task details" })
  await expect(details.getByRole("heading", { name: "Subtasks" })).toContainText(`${done} of ${total} done`)
})

When("{word} completes the task {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await saving(page, () => page.getByRole("checkbox", { name: `Mark ${title} complete` }).click())
})

Then("{word} sees the task {string}", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await expect(page.getByRole("main").getByRole("button", { name: title, exact: true })).toBeVisible()
})

Then("{word} sees the task {string} as completed", async ({ people }, name: string, title: string) => {
  const { page } = await people.get(name)
  await expect(page.getByRole("checkbox", { name: `Mark ${title} incomplete` })).toBeChecked()
})
