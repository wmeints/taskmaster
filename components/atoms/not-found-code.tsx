import { cn } from "cn"

// "404" set large, with an empty, dashed checkbox in place of the 0.
function NotFoundCode({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="404"
      className={cn("flex items-center text-8xl leading-none font-black tracking-tighter sm:text-9xl", className)}
    >
      <span aria-hidden>4</span>
      <svg aria-hidden viewBox="0 0 120 120" className="mx-1 size-[0.95em] -rotate-3 text-primary sm:mx-2">
        <rect
          x="8"
          y="8"
          width="104"
          height="104"
          rx="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="18 12"
          strokeLinecap="round"
        />
      </svg>
      <span aria-hidden>4</span>
    </div>
  )
}

export { NotFoundCode }
