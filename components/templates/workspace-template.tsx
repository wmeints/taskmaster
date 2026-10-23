// The signed-in app's frame: the sidebar, and the current view next to it. Small screens swap the sidebar
// for a bar above the view and tabs below it. Stays mounted while the user switches between views and lists.
function WorkspaceTemplate({
  sidebar,
  header,
  tabBar,
  children,
}: {
  sidebar: React.ReactNode
  // Above the view on small screens.
  header?: React.ReactNode
  // Below the view on small screens.
  tabBar?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div className="hidden w-60 shrink-0 border-r bg-sidebar md:flex">{sidebar}</div>
      <div className="flex min-w-0 flex-1 flex-col">
        {header && <div className="md:hidden">{header}</div>}
        <div className="flex min-h-0 flex-1">{children}</div>
        {tabBar && <div className="md:hidden">{tabBar}</div>}
      </div>
    </div>
  )
}

export { WorkspaceTemplate }
