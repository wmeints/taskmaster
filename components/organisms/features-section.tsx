import { Calendar, Hash, Inbox, ListChecks, Smartphone, Users } from "lucide-react"

import { FeatureCard } from "@/components/molecules/feature-card"

const features = [
  {
    icon: Inbox,
    title: "Inbox for quick capture",
    description:
      "Drop a task in the moment you think of it. Sort out deadlines and lists later.",
  },
  {
    icon: Calendar,
    title: "Today, Tomorrow, End of week, Later",
    description:
      "Four deadline views show exactly what is due and when. Hide completed tasks with one key.",
  },
  {
    icon: Hash,
    title: "Lists for your projects",
    description:
      "Group tasks per project, home chore or reading pile, and see each list’s open count at a glance.",
  },
  {
    icon: ListChecks,
    title: "Subtasks for big work",
    description:
      "Split a task into small steps and watch the progress bar fill as you tick them off.",
  },
  {
    icon: Users,
    title: "Share lists with others",
    description:
      "Invite people to a list by email. Everyone can add, edit, complete and delete tasks together.",
  },
  {
    icon: Smartphone,
    title: "Works on your phone",
    description:
      "The same web app on any screen size, with touch-friendly controls and a quick-add sheet.",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-4 border-t bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything a todo app needs.
          <br />
          Nothing it doesn’t.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Capture quickly, plan by deadline, and break big work into small steps.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { FeaturesSection }
