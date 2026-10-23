import { LoadingBar } from "@/components/atoms/loading-bar"

// One view or list: its content with a shortcut bar under it, and a details panel on the right.
function ViewTemplate({
  footer,
  detail,
  emptyDetail,
  busy = false,
  children,
}: {
  footer: React.ReactNode
  // The open task; covers the whole screen on small screens.
  detail?: React.ReactNode
  // Fills the panel on wide screens while no task is open.
  emptyDetail?: React.ReactNode
  // The view is loading.
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <div className="relative flex min-w-0 flex-1 flex-col">
        {busy && <LoadingBar className="absolute inset-x-0 top-0 z-10" />}
        <main aria-busy={busy || undefined} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 lg:px-10">{children}</div>
        </main>
        <footer className="hidden border-t px-8 py-3 md:block">{footer}</footer>
      </div>
      {detail && (
        <aside
          aria-label="Task details"
          className="fixed inset-0 z-40 flex overflow-y-auto bg-background lg:static lg:z-auto lg:w-90 lg:shrink-0 lg:border-l"
        >
          {detail}
        </aside>
      )}
      {!detail && emptyDetail && (
        <div className="hidden w-90 shrink-0 overflow-y-auto border-l lg:flex">{emptyDetail}</div>
      )}
    </>
  )
}

export { ViewTemplate }
