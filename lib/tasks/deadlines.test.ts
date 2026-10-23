import { describe, expect, it } from "vitest"

import { dateForPreset, dateForWeekday, describeDate, describeDue, presetOf, todayIn, viewOf } from "./deadlines"

// Wednesday 21 October 2026, as in the design.
const today = "2026-10-21"

describe("viewOf", () => {
  it("puts tasks without a deadline in the inbox", () => {
    expect(viewOf(null, today)).toBe("inbox")
  })

  it("puts tasks due today or overdue in today", () => {
    expect(viewOf("2026-10-21", today)).toBe("today")
    expect(viewOf("2026-10-02", today)).toBe("today")
  })

  it("puts tasks due tomorrow in tomorrow", () => {
    expect(viewOf("2026-10-22", today)).toBe("tomorrow")
  })

  it("puts tasks due after tomorrow up to Sunday in end of week", () => {
    expect(viewOf("2026-10-23", today)).toBe("end-of-week")
    expect(viewOf("2026-10-25", today)).toBe("end-of-week")
  })

  it("puts tasks due after this week in later", () => {
    expect(viewOf("2026-10-26", today)).toBe("later")
  })

  it("leaves end of week empty on a Sunday", () => {
    expect(viewOf("2026-10-26", "2026-10-25")).toBe("tomorrow")
    expect(viewOf("2026-10-27", "2026-10-25")).toBe("later")
  })
})

describe("dateForPreset", () => {
  it("picks a date for each preset", () => {
    expect(dateForPreset("today", today)).toBe("2026-10-21")
    expect(dateForPreset("tomorrow", today)).toBe("2026-10-22")
    expect(dateForPreset("end-of-week", today)).toBe("2026-10-25")
    expect(dateForPreset("later", today)).toBe("2026-10-26")
    expect(dateForPreset("none", today)).toBeNull()
  })

  it("crosses month and year boundaries", () => {
    expect(dateForPreset("tomorrow", "2026-12-31")).toBe("2027-01-01")
  })
})

describe("presetOf", () => {
  it("names the preset that produces the deadline", () => {
    expect(presetOf(null, today)).toBe("none")
    expect(presetOf("2026-10-21", today)).toBe("today")
    expect(presetOf("2026-10-25", today)).toBe("end-of-week")
    expect(presetOf("2026-10-26", today)).toBe("later")
  })

  it("returns null for a picked date that no preset produces", () => {
    expect(presetOf("2026-10-23", today)).toBeNull()
    expect(presetOf("2026-11-30", today)).toBeNull()
    expect(presetOf("2026-10-01", today)).toBeNull()
  })
})

describe("describeDue", () => {
  it("uses relative names for today and tomorrow", () => {
    expect(describeDue({ date: "2026-10-21", time: null }, today)).toBe("Today")
    expect(describeDue({ date: "2026-10-22", time: "09:30" }, today)).toBe("Tomorrow, 09:30")
  })

  it("adds the time when there is one", () => {
    expect(describeDue({ date: "2026-10-21", time: "14:00" }, today)).toBe("Today, 14:00")
  })

  it("uses weekday and date for other days", () => {
    expect(describeDue({ date: "2026-10-23", time: null }, today)).toBe("Fri 23 Oct")
    expect(describeDue({ date: "2026-10-19", time: "08:00" }, today)).toBe("Mon 19 Oct, 08:00")
  })
})

describe("describeDate", () => {
  it("spells out the weekday and month", () => {
    expect(describeDate("2026-10-21")).toBe("Wednesday 21 October")
  })
})

describe("todayIn", () => {
  it("returns the calendar date in the given time zone", () => {
    const now = new Date("2026-10-21T23:30:00Z")

    expect(todayIn("UTC", now)).toBe("2026-10-21")
    expect(todayIn("Europe/Amsterdam", now)).toBe("2026-10-22")
  })

  it("falls back to UTC for an unknown time zone", () => {
    expect(todayIn("Not/AZone", new Date("2026-10-21T23:30:00Z"))).toBe("2026-10-21")
  })
})

describe("dateForWeekday", () => {
  // 21 October 2026 is a Wednesday.
  it("finds the next given weekday, counting today", () => {
    expect(dateForWeekday(5, "2026-10-21")).toBe("2026-10-23")
    expect(dateForWeekday(3, "2026-10-21")).toBe("2026-10-21")
    expect(dateForWeekday(1, "2026-10-21")).toBe("2026-10-26")
  })
})
