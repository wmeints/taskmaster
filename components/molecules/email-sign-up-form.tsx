import Form from "next/form"
import { ArrowRight } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Hands the email over to the sign-up page, which prefills it.
function EmailSignUpForm({
  id,
  submitLabel,
  showArrow = false,
  className,
}: {
  id: string
  submitLabel: string
  showArrow?: boolean
  className?: string
}) {
  return (
    <Form action="/auth/sign-up" className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>Email address</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-10 bg-background sm:flex-1"
        />
        <Button type="submit" size="lg" className="h-10 px-4">
          {submitLabel}
          {showArrow && <ArrowRight data-icon="inline-end" />}
        </Button>
      </div>
    </Form>
  )
}

export { EmailSignUpForm }
