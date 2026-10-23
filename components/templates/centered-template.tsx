// Centers a single column of content on the page, e.g. for the auth and account pages.
function CenteredTemplate({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">{children}</main>
  )
}

export { CenteredTemplate }
