import type { LucideIcon } from "lucide-react"

import { IconBadge } from "@/components/atoms/icon-badge"

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground">
      <IconBadge icon={icon} />
      <h3 className="mt-1 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  )
}

export { FeatureCard }
