"use client"

import { useId } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUpSchema } from "@/lib/auth/schemas"

const emailSchema = signUpSchema.pick({ email: true })

type EmailValues = z.infer<typeof emailSchema>

// Hands the email over to the sign-up page, which prefills it.
function EmailSignUpForm({
  submitLabel,
  showArrow = false,
  className,
}: {
  submitLabel: string
  showArrow?: boolean
  className?: string
}) {
  const id = useId()
  const router = useRouter()
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  function onSubmit({ email }: EmailValues) {
    router.push(`/auth/sign-up?${new URLSearchParams({ email })}`)
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)} className={className}>
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>Email address</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                {...field}
                id={id}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={fieldState.invalid}
                className="h-10 bg-background sm:flex-1"
              />
              <Button type="submit" size="lg" className="h-10 px-4">
                {submitLabel}
                {showArrow && <ArrowRight data-icon="inline-end" />}
              </Button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  )
}

export { EmailSignUpForm }
