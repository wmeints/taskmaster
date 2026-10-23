import { cn } from "cn"

// A thin bar with a stripe sweeping across it, for work of unknown length such as loading a view.
function LoadingBar({ className }: { className?: string }) {
  return (
    <div role="progressbar" aria-label="Loading" className={cn("relative h-0.5 overflow-hidden bg-primary/15", className)}>
      <div className="absolute inset-y-0 -left-2/5 w-2/5 animate-loading-bar bg-primary motion-reduce:left-0 motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-40" />
    </div>
  )
}

export { LoadingBar }
