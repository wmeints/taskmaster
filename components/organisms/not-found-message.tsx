"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CornerDownLeftIcon, SearchIcon } from "lucide-react"
import { cn } from "cn"

import { NotFoundCode } from "@/components/atoms/not-found-code"
import { buttonVariants } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useShortcuts } from "@/hooks/use-shortcuts"

const todayHref = "/today"
// The workspace opens search when it arrives with ?search.
const searchHref = "/today?search"

// Tells the user the page doesn't exist and offers a way back: ↵ for Today, ⌘K to search.
function NotFoundMessage({ className }: { className?: string }) {
  const router = useRouter()

  useShortcuts({ "mod+k": () => router.push(searchHref) })

  // ↵ only when nothing has focus, so a focused link or button still does its own thing.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.target !== document.body) return
      event.preventDefault()
      router.push(todayHref)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [router])

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <NotFoundCode />
      <p className="mt-8 text-xs font-semibold tracking-wider text-primary uppercase">Error 404 · Page not found</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tighter text-balance sm:text-5xl">This task doesn’t exist.</h1>
      <p className="mt-5 max-w-lg text-lg text-pretty text-muted-foreground">
        We checked every list, every deadline and even the completed pile. The page you’re after was never added —
        or someone deleted it and didn’t press Undo.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={todayHref} className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-4 text-base")}>
          Back to Today
          <Kbd aria-hidden className="border border-primary-foreground/50 bg-transparent text-primary-foreground">
            <CornerDownLeftIcon />
          </Kbd>
        </Link>
        <Link
          href={searchHref}
          aria-keyshortcuts="Meta+K Control+K"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 gap-2 px-4 text-base")}
        >
          <SearchIcon aria-hidden />
          Search tasks
          <Kbd aria-hidden className="border bg-muted">
            ⌘K
          </Kbd>
        </Link>
      </div>
    </div>
  )
}

export { NotFoundMessage }
