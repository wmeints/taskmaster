import { describe, expect, it } from "vitest"

import { signInSchema, signUpSchema } from "./schemas"

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? []
}

describe("signInSchema", () => {
  it("accepts an email and password", () => {
    const result = signInSchema.safeParse({ email: "ada@example.com", password: "secret" })

    expect(result.success).toBe(true)
  })

  it("trims the email", () => {
    const result = signInSchema.parse({ email: "  ada@example.com ", password: "secret" })

    expect(result.email).toBe("ada@example.com")
  })

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "secret" })

    expect(messages(result)).toEqual(["Enter a valid email address"])
  })

  it("requires a password", () => {
    const result = signInSchema.safeParse({ email: "ada@example.com", password: "" })

    expect(messages(result)).toEqual(["Enter your password"])
  })
})

describe("signUpSchema", () => {
  const valid = { name: "Ada", email: "ada@example.com", password: "correct horse" }

  it("accepts a name, email and password", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it("requires a name", () => {
    const result = signUpSchema.safeParse({ ...valid, name: "   " })

    expect(messages(result)).toEqual(["Enter your name"])
  })

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({ ...valid, email: "ada" })

    expect(messages(result)).toEqual(["Enter a valid email address"])
  })

  it("requires a password of at least 8 characters", () => {
    const result = signUpSchema.safeParse({ ...valid, password: "short" })

    expect(messages(result)).toEqual(["Use at least 8 characters"])
  })
})
