import Link from "next/link"
import { cn } from "cn"

import { LogoMark } from "@/components/atoms/logo-mark"

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      Taskmaster
    </Link>
  )
}

export { Logo }
