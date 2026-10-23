// The app's main layout: sidebar, the current view with a shortcut bar under it, and an optional
// details panel on the right.
function WorkspaceTemplate({
  sidebar,
  footer,
  detail,
  children,
}: {
  sidebar: React.ReactNode
  footer: React.ReactNode
  detail?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div className="hidden w-60 shrink-0 border-r bg-sidebar md:flex">{sidebar}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">
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
    </div>
  )
}

export { WorkspaceTemplate }
