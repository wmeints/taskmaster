import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ServerErrorPage } from "./server-error-page"

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("ServerErrorPage", () => {
  it("shows the reference of an error from the server, to match it in the logs", () => {
    render(<ServerErrorPage error={Object.assign(new Error("boom"), { digest: "2943841913" })} retry={vi.fn()} />)

    expect(screen.getByText("2943841913")).toBeInTheDocument()
  })

  it("leaves the reference out when there is none", () => {
    render(<ServerErrorPage error="not an Error" retry={vi.fn()} />)

    expect(screen.getByRole("heading", { name: "Well, we dropped the ball." })).toBeInTheDocument()
    expect(screen.queryByText(/mention reference/)).not.toBeInTheDocument()
  })

  it("logs the error", () => {
    const error = new Error("boom")
    render(<ServerErrorPage error={error} retry={vi.fn()} />)

    expect(console.error).toHaveBeenCalledWith(error)
  })

  it("tries again", async () => {
    const retry = vi.fn()
    render(<ServerErrorPage error={new Error("boom")} retry={retry} />)

    await userEvent.click(screen.getByRole("button", { name: "Try again" }))

    expect(retry).toHaveBeenCalledOnce()
  })
})
