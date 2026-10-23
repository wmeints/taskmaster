import { dateForPreset, describeDate } from "./deadlines"
import { viewTitles, type List, type Scope } from "./types"

export type Heading = { title: string; subtitle?: string }

// The title and subtitle above a view or list. Null for a list that isn't among the given lists.
export function headingFor(scope: Scope, { lists, today }: { lists: List[]; today: string }): Heading | null {
  if ("listId" in scope) {
    const list = lists.find((l) => l.id === scope.listId)
    if (!list) return null
    return { title: list.name, subtitle: `${list.openCount} open ${list.openCount === 1 ? "task" : "tasks"}` }
  }

  const title = viewTitles[scope.view]
  if (scope.view === "today") return { title, subtitle: describeDate(today) }
  if (scope.view === "tomorrow") return { title, subtitle: describeDate(dateForPreset("tomorrow", today)!) }
  return { title }
}
