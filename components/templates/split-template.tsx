import { Logo } from "@/components/molecules/logo"

// A header with just the logo above two columns, e.g. for error pages: the content on the left and an
// illustration on the right, which wide screens show only.
function SplitTemplate({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <>
      <header className="border-b">
        <div className="flex h-14 items-center px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_auto] xl:gap-20">
        <div>{children}</div>
        <div className="hidden w-md lg:block xl:w-lg">{aside}</div>
      </main>
    </>
  )
}

export { SplitTemplate }
