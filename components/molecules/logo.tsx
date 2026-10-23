import Link from "next/link"
import { cn } from "cn"

import { LogoMark } from "@/components/atoms/logo-mark"

function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      Taskmaster
    </Link>
  )
}

export { Logo }
