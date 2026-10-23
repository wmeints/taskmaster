import { viewTitles, type Scope, type View } from "./types"

// The URL of a view or list, optionally with one of its tasks open.
export function hrefFor(scope: Scope, taskId?: string): string {
  const path = "view" in scope ? `/${scope.view}` : `/lists/${encodeURIComponent(scope.listId)}`
  return taskId ? `${path}?task=${encodeURIComponent(taskId)}` : path
}

// The view or list a route shows, or null when it shows neither.
export function scopeFor(pathname: string): Scope | null {
  const list = /^\/lists\/([^/]+)$/.exec(pathname)
  if (list) return { listId: decodeURIComponent(list[1]) }
  const view = pathname.slice(1)
  return view in viewTitles ? { view: view as View } : null
}
