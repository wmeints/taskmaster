import { describe, expect, it } from "vitest"

import { parseQuickAdd } from "./quick-add"
import type { List } from "./types"

// A Wednesday.
const today = "2026-10-21"

const lists: List[] = [
  { id: "home", name: "Home renovation", color: "orange", openCount: 0 },
  { id: "web", name: "Website relaunch", color: "blue", openCount: 0 },
  { id: "read", name: "Reading", color: "emerald", openCount: 0 },
]

const parse = (text: string) => parseQuickAdd(text, { lists, today })

describe("parseQuickAdd", () => {
  it("recognises a deadline and a list, and keeps the rest as the title", () => {
    expect(parse("Call the dentist tomorrow #home")).toEqual({
      title: "Call the dentist",
      due: { date: "2026-10-22", time: null },
      list: { id: "home", name: "Home renovation", color: "orange" },
    })
  })

  it("leaves plain text alone", () => {
    expect(parse("  Buy   paint ")).toEqual({ title: "Buy paint", due: null, list: null })
  })

  it("recognises today and tomorrow in any case", () => {
    expect(parse("Pay rent Today").due).toEqual({ date: today, time: null })
    expect(parse("TOMORROW: water plants")).toMatchObject({ title: "water plants", due: { date: "2026-10-22" } })
  })

  it("takes a weekday to mean the next one, counting today", () => {
    expect(parse("Review fri").due?.date).toBe("2026-10-23")
    expect(parse("Review friday").due?.date).toBe("2026-10-23")
    expect(parse("Review mon").due?.date).toBe("2026-10-26")
    expect(parse("Review wed").due?.date).toBe(today)
  })

  it("recognises the end of the week", () => {
    expect(parse("Send invoice end of week").due?.date).toBe("2026-10-25")
  })

  it("recognises a time, on its own meaning today", () => {
    expect(parse("Call the bank fri 15:00").due).toEqual({ date: "2026-10-23", time: "15:00" })
    expect(parse("Stand-up at 9:30").due).toEqual({ date: today, time: "09:30" })
    expect(parse("Dinner tomorrow 7pm")).toEqual({ title: "Dinner", due: { date: "2026-10-22", time: "19:00" }, list: null })
    expect(parse("Lunch 12:30am").due?.time).toBe("00:30")
  })

  it("doesn't take words that merely contain a date", () => {
    expect(parse("Read today's paper")).toMatchObject({ title: "Read today's paper", due: null })
    expect(parse("Buy sunscreen").due).toBeNull()
  })

  it("matches a list by the start of its name or of any word in it", () => {
    expect(parse("Fix header #web").list?.id).toBe("web")
    expect(parse("Fix header #relaunch").list?.id).toBe("web")
    expect(parse("Fix header #WebsiteRelaunch").list?.id).toBe("web")
    expect(parse("Fix header #website-relaunch").list?.id).toBe("web")
  })

  it("keeps a tag that matches no list in the title", () => {
    expect(parse("Plan trip #holiday")).toEqual({ title: "Plan trip #holiday", due: null, list: null })
  })
})
