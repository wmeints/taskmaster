import { NextRequest, NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { guard } = vi.hoisted(() => ({ guard: vi.fn() }))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/server", () => ({ auth: { middleware: () => guard } }))

import proxy from "./proxy"

const signedIn = () => {
  const response = NextResponse.next()
  response.headers.append("Set-Cookie", "session=refreshed; Path=/")
  return response
}
const signedOut = () => NextResponse.redirect("http://localhost/auth/sign-in")

beforeEach(() => {
  vi.clearAllMocks()
})

describe("proxy on the landing page", () => {
  it("sends signed-in users to Today", async () => {
    guard.mockResolvedValue(signedIn())

    const response = await proxy(new NextRequest("http://localhost/"))

    expect(response.headers.get("location")).toBe("http://localhost/today")
  })

  it("keeps the refreshed session cookie when redirecting", async () => {
    guard.mockResolvedValue(signedIn())

    const response = await proxy(new NextRequest("http://localhost/"))

    expect(response.headers.getSetCookie()).toContain("session=refreshed; Path=/")
  })

  it("shows the landing page to signed-out visitors", async () => {
    guard.mockResolvedValue(signedOut())

    const response = await proxy(new NextRequest("http://localhost/"))

    expect(response.headers.get("location")).toBeNull()
  })
})

describe("proxy on workspace routes", () => {
  it("sends signed-out visitors to sign in", async () => {
    guard.mockResolvedValue(signedOut())

    const response = await proxy(new NextRequest("http://localhost/today"))

    expect(response.headers.get("location")).toBe("http://localhost/auth/sign-in")
  })

  it("lets signed-in users through", async () => {
    guard.mockResolvedValue(signedIn())

    const response = await proxy(new NextRequest("http://localhost/today"))

    expect(response.headers.get("location")).toBeNull()
  })
})
