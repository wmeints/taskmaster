"use client"

import Link from "next/link"
import { cn } from "cn"

import { ServerErrorCode } from "@/components/atoms/server-error-code"
import { Button, buttonVariants } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useShortcuts } from "@/hooks/use-shortcuts"

// Tells the user the server failed and offers a way out: R to try again, or Today. The digest matches
// the error in the server logs.
function ServerErrorMessage({
  digest,
  onRetry,
  className,
}: {
  digest?: string
  onRetry: () => void
  className?: string
}) {
  useShortcuts({ r: onRetry })

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <ServerErrorCode />
      <p className="mt-8 text-xs font-semibold tracking-wider text-primary uppercase">Error 500 · Something broke</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tighter text-balance sm:text-5xl">
        Well, we dropped the ball.
      </h1>
      <p className="mt-5 max-w-lg text-lg text-pretty text-muted-foreground">
        Something went wrong on our side, not yours. Your tasks are safe — we just can’t show them right now. Our
        server has added a new item to its own todo list.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" aria-keyshortcuts="R" onClick={onRetry} className="h-11 gap-2 px-4 text-base">
          Try again
          <Kbd aria-hidden className="border border-primary-foreground/50 bg-transparent text-primary-foreground">
            R
          </Kbd>
        </Button>
        <Link href="/today" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-4 text-base")}>
          Go to Today
        </Link>
      </div>
      {digest && (
        <p className="mt-6 max-w-lg text-xs text-muted-foreground">
          If this keeps happening, mention reference{" "}
          <code className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-foreground">{digest}</code> when you
          contact us.
        </p>
      )}
    </div>
  )
}

export { ServerErrorMessage }
