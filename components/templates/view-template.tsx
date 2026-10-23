import { LoadingBar } from "@/components/atoms/loading-bar"

// One view or list: its content with a shortcut bar under it, and a details panel on the right while a
// task is open.
function ViewTemplate({
  footer,
  detail,
  action,
  busy = false,
  children,
}: {
  footer: React.ReactNode
  // The open task; covers the whole screen on small screens.
  detail?: React.ReactNode
  // Floats over the bottom of the view on small screens, such as a button to add a task.
  action?: React.ReactNode
  // The view is loading.
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <div className="relative flex min-w-0 flex-1 flex-col">
        {busy && <LoadingBar className="absolute inset-x-0 top-0 z-10" />}
        <main aria-busy={busy || undefined} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 pt-2 pb-28 md:px-6 md:py-8 lg:px-10">{children}</div>
        </main>
        <footer className="hidden border-t px-8 py-3 md:block">{footer}</footer>
        {action && <div className="absolute right-5 bottom-5 z-30 md:hidden">{action}</div>}
      </div>
      {detail && (
        <aside
          aria-label="Task details"
          className="fixed inset-0 z-40 flex overflow-y-auto bg-background lg:static lg:z-auto lg:w-90 lg:shrink-0 lg:border-l"
        >
          {detail}
        </aside>
      )}
    </>
  )
}

export { ViewTemplate }
