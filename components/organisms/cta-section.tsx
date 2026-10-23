import Link from "next/link"
import { cn } from "cn"

import { LogoMark } from "@/components/atoms/logo-mark"
import { EmailSignUpForm } from "@/components/molecules/email-sign-up-form"
import { buttonVariants } from "@/components/ui/button"

function CtaSection() {
  return (
    <section id="get-started" className="scroll-mt-4">
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:py-24">
        <LogoMark className="size-8" />
        <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to start todoing?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Create an account in seconds, or log in to pick up where you left off.
        </p>
        <EmailSignUpForm submitLabel="Sign up" className="mt-8 w-full text-left" />
        <Link
          href="/auth/sign-in"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-4 h-10 px-4")}
        >
          I already have an account – Log in
        </Link>
      </div>
    </section>
  )
}

export { CtaSection }
