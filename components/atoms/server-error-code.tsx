import { cn } from "cn"

// "500" set large, with a failed checkbox and an empty one in place of the 0s.
function ServerErrorCode({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="500"
      className={cn("flex items-center gap-1.5 text-8xl leading-none font-black tracking-tighter sm:gap-2.5 sm:text-9xl", className)}
    >
      <span aria-hidden className="mr-1">5</span>
      <svg aria-hidden viewBox="0 0 120 120" className="size-[0.75em]">
        <rect x="8" y="8" width="104" height="104" rx="18" fill="none" stroke="currentColor" strokeWidth="12" />
        <path d="M40 40 80 80M80 40 40 80" stroke="var(--destructive)" strokeWidth="12" strokeLinecap="round" />
      </svg>
      <svg aria-hidden viewBox="0 0 120 120" className="size-[0.75em] rotate-1">
        <rect x="8" y="8" width="104" height="104" rx="18" fill="none" stroke="currentColor" strokeWidth="12" />
      </svg>
    </div>
  )
}

export { ServerErrorCode }
