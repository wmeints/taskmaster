import Link from "next/link"

import { Logo } from "@/components/molecules/logo"
import { buttonVariants } from "@/components/ui/button"

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#keyboard", label: "Keyboard" },
  { href: "#get-started", label: "Get started" },
]

function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden gap-4 text-sm sm:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/auth/sign-in" className={buttonVariants({ variant: "ghost" })}>
            Log in
          </Link>
          <Link href="/auth/sign-up" className={buttonVariants()}>
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
