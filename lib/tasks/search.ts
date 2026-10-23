import type { Overview } from "./types"

type Searchable = Overview["searchable"][number]

export type Match = { task: Searchable; highlights: [start: number, end: number][] }

// Words that would match nearly every task.
const stopWords = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"])

// Finds tasks with words starting like the query's words, the best matches first, with the matching
// parts of their titles to highlight.
export function searchTasks(query: string, tasks: Searchable[], { limit = 8 } = {}): Match[] {
  const words = [...new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u))].filter(
    (word) => word.length > 1 && !stopWords.has(word),
  )
  if (words.length === 0) return []

  const scored = tasks.flatMap((task) => {
    const ranges: [number, number][] = []
    let score = 0
    for (const word of words) {
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escape(word)}`, "giu")
      const found = [...task.title.matchAll(pattern)].map((match): [number, number] => [match.index, match.index + word.length])
      if (found.length > 0) score++
      ranges.push(...found)
    }
    return score > 0 ? [{ task, highlights: merge(ranges), score }] : []
  })

  return scored
    .sort((a, b) => b.score - a.score || Number(a.task.completed) - Number(b.task.completed))
    .slice(0, limit)
    .map(({ task, highlights }) => ({ task, highlights }))
}

function merge(ranges: [number, number][]): [number, number][] {
  const sorted = ranges.toSorted((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [start, end] of sorted) {
    const last = merged.at(-1)
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  return merged
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
