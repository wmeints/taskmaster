import Link from "next/link"

import { EmailSignUpForm } from "@/components/molecules/email-sign-up-form"
import { AppPreview } from "@/components/organisms/app-preview"
import { Kbd } from "@/components/ui/kbd"

function Hero() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border px-2 py-1 text-xs">
          <Kbd className="border bg-background font-semibold text-foreground">⌘K</Kbd>
          Built for the keyboard
        </p>
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
          Get things done, one keystroke <span className="text-primary">at a time.</span>
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          Taskmaster is a fast, focused todo app. Drop ideas into your Inbox, plan Today, Tomorrow
          and the rest of the week, and share lists with the people you work with.
        </p>
        <div className="flex max-w-md flex-col gap-3">
          <EmailSignUpForm submitLabel="Create account" showArrow />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-foreground underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <AppPreview />
    </section>
  )
}

export { Hero }
