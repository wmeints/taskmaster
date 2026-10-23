// Deadline arithmetic on calendar dates. Dates are ISO strings ("2026-10-21") in the user's time
// zone, so nothing here depends on the clock or time zone of the machine running it.

export type View = "inbox" | "today" | "tomorrow" | "end-of-week" | "later"

export type DeadlinePreset = "today" | "tomorrow" | "end-of-week" | "later" | "none"

export type Due = { date: string; time: string | null }

const presets = ["today", "tomorrow", "end-of-week", "later", "none"] as const

// The view a task with this deadline shows up in. Overdue tasks stay in today.
export function viewOf(date: string | null, today: string): View {
  if (date === null) return "inbox"
  if (date <= today) return "today"
  if (date === addDays(today, 1)) return "tomorrow"
  if (date <= endOfWeek(today)) return "end-of-week"
  return "later"
}

export function dateForPreset(preset: DeadlinePreset, today: string): string | null {
  switch (preset) {
    case "today":
      return today
    case "tomorrow":
      return addDays(today, 1)
    case "end-of-week":
      return endOfWeek(today)
    case "later":
      return addDays(endOfWeek(today), 1)
    case "none":
      return null
  }
}

// The next given weekday (0 is Sunday), counting today.
export function dateForWeekday(weekday: number, today: string): string {
  return addDays(today, (weekday - toUtcDate(today).getUTCDay() + 7) % 7)
}

// The preset that would set this deadline, or null when it was picked from the calendar.
export function presetOf(date: string | null, today: string): DeadlinePreset | null {
  return presets.find((preset) => dateForPreset(preset, today) === date) ?? null
}

// A short label such as "Today, 14:00", "Tomorrow" or "Fri 23 Oct".
export function describeDue(due: Due, today: string): string {
  const day =
    due.date === today
      ? "Today"
      : due.date === addDays(today, 1)
        ? "Tomorrow"
        : toUtcDate(due.date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
          }).replace(",", "")
  return due.time ? `${day}, ${due.time}` : day
}

// A long label such as "Wednesday 21 October".
export function describeDate(date: string): string {
  return toUtcDate(date)
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    .replace(",", "")
}

// The cookie the browser stores its IANA time zone in, so the server knows the user's today.
export const timeZoneCookie = "tz"

export function todayIn(timeZone: string, now = new Date()): string {
  try {
    // The Swedish locale formats dates as YYYY-MM-DD.
    return now.toLocaleDateString("sv-SE", { timeZone })
  } catch {
    return now.toISOString().slice(0, 10)
  }
}

// Weeks end on Sunday.
function endOfWeek(date: string): string {
  const weekday = toUtcDate(date).getUTCDay()
  return addDays(date, (7 - weekday) % 7)
}

function addDays(date: string, days: number): string {
  const result = toUtcDate(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}
