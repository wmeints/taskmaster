import { CountBadge } from "@/components/atoms/count-badge"

function SectionHeading({ title, count, action }: { title: string; count: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {title}
        <CountBadge count={count} />
      </h2>
      {action}
    </div>
  )
}

export { SectionHeading }
