// The signed-in app's frame: the sidebar, and the current view next to it. Stays mounted while the user
// switches between views and lists.
function WorkspaceTemplate({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div className="hidden w-60 shrink-0 border-r bg-sidebar md:flex">{sidebar}</div>
      <div className="flex min-w-0 flex-1">{children}</div>
    </div>
  )
}

export { WorkspaceTemplate }
