import { dateForPreset, dateForWeekday, type Due } from "./deadlines"
import type { List, Task } from "./types"

// newList is the name of a tag that matches no list, when new lists are wanted.
export type QuickAdd = { title: string; due: Due | null; list: Task["list"]; newList?: string }

// Whole words only: "today's" or "sunscreen" are not dates.
const word = (pattern: string) => new RegExp(`(?<![\\w'’#-])(?:${pattern})(?![\\w'’-])`, "i")

const weekdays = [
  "sun(?:day)?",
  "mon(?:day)?",
  "tue(?:s|sday)?",
  "wed(?:nesday)?",
  "thu(?:r|rs|rsday)?",
  "fri(?:day)?",
  "sat(?:urday)?",
]

const dates: { pattern: RegExp; date: (today: string, match: RegExpExecArray) => string }[] = [
  { pattern: word("end of (?:the )?week"), date: (today) => dateForPreset("end-of-week", today)! },
  { pattern: word("today|tonight"), date: (today) => today },
  { pattern: word("tomorrow|tmrw"), date: (today) => dateForPreset("tomorrow", today)! },
  {
    pattern: word(weekdays.map((day) => `(${day})`).join("|")),
    date: (today, match) => dateForWeekday(match.slice(1).findIndex(Boolean), today),
  },
]

// "15:00", "9:30", "7pm" or "12:30am", optionally after "at". A bare number is not a time.
const time = word("(?:at\\s+)?(\\d{1,2})(?::(\\d{2})\\s*(am|pm)?|\\s*(am|pm))")

// "^today", "^tomorrow", "^next week" or "^2026-12-01".
const marked = /(?<!\S)\^(today|tomorrow|next\s+week|\d{4}-\d{2}-\d{2})(?!\S)/i

// "#home", or "#"Home renovation"" for a name with spaces.
const tag = /(?<!\S)#(?:["“]([^"“”]+)["”]|([\p{L}\p{N}_-]+))/u

// Reads the deadline ("^next week", "tomorrow", "fri 15:00") and the list ("#home") out of a quick add,
// and returns what is left as the title. Without naturalDates, only "^" marks a deadline. With newLists, a
// tag that matches no list names a new one instead of staying in the title.
export function parseQuickAdd(
  text: string,
  {
    lists,
    today,
    naturalDates = true,
    newLists = false,
  }: { lists: List[]; today: string; naturalDates?: boolean; newLists?: boolean },
): QuickAdd {
  let rest = ` ${text} `
  const take = (match: RegExpExecArray) => {
    rest = rest.slice(0, match.index) + " " + rest.slice(match.index + match[0].length)
  }

  let date: string | null = null
  const markedMatch = marked.exec(rest)
  const markedDate = markedMatch && dateForMarker(markedMatch[1].toLowerCase(), today)
  if (markedMatch && markedDate) {
    date = markedDate
    take(markedMatch)
  }

  for (const { pattern, date: dateFor } of naturalDates && !date ? dates : []) {
    const match = pattern.exec(rest)
    if (match) {
      date = dateFor(today, match)
      take(match)
      break
    }
  }

  let dueTime: string | null = null
  const timeMatch = naturalDates ? time.exec(rest) : null
  if (timeMatch) {
    const [, hours, minutes = "00", meridiem1, meridiem2] = timeMatch
    const hour = toHour(Number(hours), (meridiem1 ?? meridiem2)?.toLowerCase())
    if (hour !== null && Number(minutes) < 60) {
      dueTime = `${String(hour).padStart(2, "0")}:${minutes}`
      take(timeMatch)
    }
  }

  let list: Task["list"] = null
  let newList: string | undefined
  const tagMatch = tag.exec(rest)
  if (tagMatch) {
    const name = (tagMatch[1] ?? tagMatch[2]).trim()
    const found = findList(name, lists)
    if (found) {
      list = { id: found.id, name: found.name, color: found.color }
      take(tagMatch)
    } else if (newLists && name) {
      newList = name
      take(tagMatch)
    }
  }

  const title = rest
    .replace(/\s+/g, " ")
    .replace(/^[\s:,;–-]+|[\s:,;–-]+$/g, "")
  const due = date || dueTime ? { date: date ?? today, time: dueTime } : null
  return { title, due, list, ...(newList && { newList }) }
}

function dateForMarker(marker: string, today: string): string | null {
  if (marker === "today" || marker === "tomorrow") return dateForPreset(marker, today)
  // Next week starts the day after this one ends, where the later view begins.
  if (marker.startsWith("next")) return dateForPreset("later", today)
  // Rejects dates that don't exist, such as "2026-02-30".
  const parsed = new Date(`${marker}T00:00:00Z`)
  return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(marker) ? marker : null
}

function toHour(hour: number, meridiem: string | undefined): number | null {
  if (meridiem) {
    if (hour < 1 || hour > 12) return null
    return (hour % 12) + (meridiem === "pm" ? 12 : 0)
  }
  return hour < 24 ? hour : null
}

// "#web", "#relaunch" and "#website-relaunch" all find "Website relaunch".
function findList(name: string, lists: List[]): List | undefined {
  const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")
  const wanted = normalize(name)
  return (
    lists.find((list) => normalize(list.name).startsWith(wanted)) ??
    lists.find((list) => list.name.split(/[^\p{L}\p{N}]+/u).some((part) => normalize(part).startsWith(wanted)))
  )
}
