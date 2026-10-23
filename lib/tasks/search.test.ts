import { describe, expect, it } from "vitest"

import { searchTasks } from "./search"

const tasks = [
  { id: "1", title: "Find a dentist near the new place", view: "inbox" as const, completed: false },
  { id: "2", title: "Book dentist check-up", view: "today" as const, completed: true },
  { id: "3", title: "Call the plumber", view: "today" as const, completed: false },
  { id: "4", title: "Water the plants", view: "later" as const, completed: false },
]

describe("searchTasks", () => {
  it("finds tasks sharing a meaningful word, and highlights it", () => {
    expect(searchTasks("dentist", tasks)).toEqual([
      { task: tasks[0], highlights: [[7, 14]] },
      { task: tasks[1], highlights: [[5, 12]] },
    ])
  })

  it("ignores small and common words", () => {
    expect(searchTasks("the a", tasks)).toEqual([])
  })

  it("ranks tasks matching more words first, and open tasks before completed ones", () => {
    const ids = searchTasks("call the dentist", tasks).map((match) => match.task.id)
    expect(ids).toEqual(["1", "3", "2"])
  })

  it("matches the start of words, ignoring case", () => {
    expect(searchTasks("PLUM", tasks).map((match) => match.task.id)).toEqual(["3"])
    expect(searchTasks("lumber", tasks)).toEqual([])
  })

  it("highlights every occurrence, merged and in order", () => {
    const [match] = searchTasks("plan plants", [{ ...tasks[3], title: "Plants: plan the plants" }])
    expect(match.highlights).toEqual([[0, 6], [8, 12], [17, 23]])
  })

  it("returns at most the given number of tasks", () => {
    expect(searchTasks("dentist", tasks, { limit: 1 })).toHaveLength(1)
  })
})
