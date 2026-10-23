import type { Due, View } from "./deadlines"

export type { DeadlinePreset, Due, View } from "./deadlines"

// In sidebar order; the number keys 1–5 switch between them.
export const viewTitles: Record<View, string> = {
  inbox: "Inbox",
  today: "Today",
  tomorrow: "Tomorrow",
  "end-of-week": "End of week",
  later: "Later",
}

export const listColors = ["blue", "orange", "emerald", "violet", "amber", "rose", "cyan"] as const

export type ListColor = (typeof listColors)[number]

export type Subtask = { id: string; title: string; done: boolean }

export type Task = {
  id: string
  title: string
  description: string
  due: Due | null
  list: { id: string; name: string; color: ListColor } | null
  completed: boolean
  subtasks: Subtask[]
}

export type List = { id: string; name: string; color: ListColor; openCount: number }

// What a workspace shows: one of the deadline views, or one of the user's lists.
export type Scope = { view: View } | { listId: string }

// What the sidebar and search show: open tasks across every view and list.
export type Overview = {
  counts: Record<View, number>
  lists: List[]
  // Every open task, so search can jump to tasks outside the current view.
  searchable: { id: string; title: string; view: View }[]
}

export type Workspace = Overview & {
  title: string
  scope: Scope
  today: string
  todo: Task[]
  completed: Task[]
}
