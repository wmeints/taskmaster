import type { List, Task, Workspace } from "@/lib/tasks/types"

// The sample data from the design, for stories: Wednesday 21 October, Today view.
export const today = "2026-10-21"

const website = { id: "8a5e7f2c-1b3d-4e6f-9a8b-7c6d5e4f3a21", name: "Website relaunch", color: "blue" as const }
const home = { id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", name: "Home renovation", color: "orange" as const }
const reading = { id: "9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a", name: "Reading", color: "emerald" as const }

export const lists: List[] = [
  { ...website, owned: true, openCount: 4 },
  { ...home, owned: true, openCount: 3 },
  { ...reading, owned: true, openCount: 1 },
]

// A list someone else owns and shared with the user.
export const sharedList: List = {
  id: "4b3a2c1d-0e9f-4a8b-9c7d-6e5f4a3b2c1d",
  name: "Team offsite",
  color: "violet",
  owned: false,
  openCount: 2,
}

export const reviewTask: Task = {
  id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697801",
  title: "Review pull request for checkout flow",
  description: "Focus on the payment error states and the empty-cart edge case.",
  due: { date: today, time: "14:00" },
  list: website,
  completed: false,
  subtasks: [
    { id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b11", title: "Run the branch locally", done: true },
    { id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b12", title: "Check payment error states", done: false },
    { id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b13", title: "Leave review comments", done: false },
  ],
}

export const todo: Task[] = [
  reviewTask,
  {
    id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697802",
    title: "Call the plumber about the kitchen tap",
    description: "",
    due: { date: today, time: null },
    list: home,
    completed: false,
    subtasks: [],
  },
  {
    id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697803",
    title: "Draft release notes",
    description: "Cover the new checkout and the account page.",
    due: { date: today, time: "17:00" },
    list: website,
    completed: false,
    subtasks: [
      { id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b21", title: "Collect merged PRs", done: false },
      { id: "5d4c3b2a-1f0e-4d9c-8b7a-6f5e4d3c2b22", title: "Write the summary", done: false },
    ],
  },
]

export const completed: Task[] = [
  {
    id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697804",
    title: "Book a venue for the team offsite",
    description: "",
    due: { date: today, time: null },
    list: null,
    completed: true,
    subtasks: [],
  },
  {
    id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697805",
    title: "Pay the electricity bill",
    description: "",
    due: { date: today, time: null },
    list: home,
    completed: true,
    subtasks: [],
  },
]

export const workspace: Workspace = {
  title: "Today",
  scope: { view: "today" },
  today,
  counts: { inbox: 3, today: 3, tomorrow: 2, "end-of-week": 2, later: 2 },
  lists,
  todo,
  completed,
  searchable: [
    ...todo.map((task) => ({ id: task.id, title: task.title, view: "today" as const, completed: false })),
    ...completed.map((task) => ({ id: task.id, title: task.title, view: "today" as const, completed: true })),
    { id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697806", title: "Order paint samples", view: "tomorrow", completed: false },
    { id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697807", title: "Find a dentist near the new place", view: "inbox", completed: false },
    { id: "0b6c3a52-6a8e-4f1b-9d2e-3c4b5a697808", title: "Book dentist check-up", view: "today", completed: true },
  ],
}
