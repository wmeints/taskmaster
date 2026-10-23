import { dateForPreset, dateForWeekday, type Due } from "./deadlines"
import type { List, Task } from "./types"

export type QuickAdd = { title: string; due: Due | null; list: Task["list"] }

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

const tag = /(?<!\S)#([\p{L}\p{N}_-]+)/u

// Reads the deadline ("tomorrow", "fri 15:00") and the list ("#home") out of a quick add, and returns
// what is left as the title.
export function parseQuickAdd(text: string, { lists, today }: { lists: List[]; today: string }): QuickAdd {
  let rest = ` ${text} `
  const take = (match: RegExpExecArray) => {
    rest = rest.slice(0, match.index) + " " + rest.slice(match.index + match[0].length)
  }

  let date: string | null = null
  for (const { pattern, date: dateFor } of dates) {
    const match = pattern.exec(rest)
    if (match) {
      date = dateFor(today, match)
      take(match)
      break
    }
  }

  let dueTime: string | null = null
  const timeMatch = time.exec(rest)
  if (timeMatch) {
    const [, hours, minutes = "00", meridiem1, meridiem2] = timeMatch
    const hour = toHour(Number(hours), (meridiem1 ?? meridiem2)?.toLowerCase())
    if (hour !== null && Number(minutes) < 60) {
      dueTime = `${String(hour).padStart(2, "0")}:${minutes}`
      take(timeMatch)
    }
  }

  let list: Task["list"] = null
  const tagMatch = tag.exec(rest)
  const found = tagMatch && findList(tagMatch[1], lists)
  if (tagMatch && found) {
    list = { id: found.id, name: found.name, color: found.color }
    take(tagMatch)
  }

  const title = rest
    .replace(/\s+/g, " ")
    .replace(/^[\s:,;–-]+|[\s:,;–-]+$/g, "")
  const due = date || dueTime ? { date: date ?? today, time: dueTime } : null
  return { title, due, list }
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
