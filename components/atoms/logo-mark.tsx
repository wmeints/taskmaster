import { SquareCheck } from "lucide-react"
import { cn } from "cn"

function LogoMark({ className }: { className?: string }) {
  return <SquareCheck aria-hidden className={cn("size-5 text-primary", className)} />
}

export { LogoMark }
