import { expect } from "@playwright/test"

import { saving, When } from "./fixtures"

When("{word} invites {word} to the list {string}", async ({ people }, name: string, invitee: string, list: string) => {
  const { page } = await people.get(name)
  const { email } = await people.get(invitee)
  await page.getByRole("button", { name: `Actions for ${list}` }).click()
  await page.getByRole("menuitem", { name: "Share list…" }).click()

  const dialog = page.getByRole("dialog", { name: `Share “${list}”` })
  await saving(page, async () => {
    await dialog.getByRole("textbox", { name: "Invite by email" }).fill(email)
    await dialog.getByRole("button", { name: "Send invite" }).click()
  })
  await expect(dialog.getByText(email)).toBeVisible()
  await dialog.getByRole("button", { name: "Done" }).click()
})

When("{word} accepts the invite to the list {string}", async ({ people }, name: string, list: string) => {
  const { page } = await people.get(name)
  // The invite arrived after the page loaded; reloading shows it right away instead of on the next refresh.
  await page.reload()
  await saving(page, () => page.getByRole("button", { name: `Accept the invite to ${list}` }).click())
})
