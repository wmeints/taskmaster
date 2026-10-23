import { Logo } from "@/components/molecules/logo"

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm">
        <Logo className="text-sm [&_svg]:size-4" />
        <p className="text-muted-foreground">© 2026 Willem Meints</p>
        <nav aria-label="Legal" className="ml-auto flex gap-4 text-muted-foreground">
          <a href="#" className="underline hover:text-foreground">Privacy</a>
          <a href="#" className="underline hover:text-foreground">Terms</a>
        </nav>
      </div>
    </footer>
  )
}

export { SiteFooter }
