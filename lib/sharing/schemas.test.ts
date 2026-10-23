import { describe, expect, it } from "vitest"

import { inviteSchema } from "./schemas"

function errorFor(emails: string) {
  const result = inviteSchema.safeParse({ emails })
  return result.success ? null : result.error.issues[0].message
}

describe("inviteSchema", () => {
  it("reads one address", () => {
    expect(inviteSchema.parse({ emails: " mara@example.com " })).toEqual({ emails: ["mara@example.com"] })
  })

  it("reads several addresses separated by commas, lower case and without repeats", () => {
    expect(inviteSchema.parse({ emails: "Mara@Example.com, joost@example.com,, mara@example.com" })).toEqual({
      emails: ["mara@example.com", "joost@example.com"],
    })
  })

  it("asks for an address when empty", () => {
    expect(errorFor(" , ")).toBe("Enter an email address")
  })

  it("names the address that isn't valid", () => {
    expect(errorFor("mara@example.com, joost")).toBe("“joost” isn't a valid email address")
  })

  it("limits how many people are invited at once", () => {
    const emails = Array.from({ length: 21 }, (_, i) => `person${i}@example.com`).join(",")
    expect(errorFor(emails)).toBe("Invite at most 20 people at a time")
  })
})
