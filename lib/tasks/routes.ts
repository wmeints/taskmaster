import type { Scope } from "./types"

// The URL of a view or list, optionally with one of its tasks open.
export function hrefFor(scope: Scope, taskId?: string): string {
  const path = "view" in scope ? `/${scope.view}` : `/lists/${encodeURIComponent(scope.listId)}`
  return taskId ? `${path}?task=${encodeURIComponent(taskId)}` : path
}
