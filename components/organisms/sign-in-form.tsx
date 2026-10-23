"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormTextField } from "@/components/molecules/form-text-field"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { signInSchema, type SignInValues } from "@/lib/auth/schemas"

function SignInForm({
  action,
}: {
  action: (values: SignInValues) => Promise<{ error: string } | undefined>
}) {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: SignInValues) {
    const result = await action(values)
    if (result?.error) {
      form.setError("root", { message: result.error })
    }
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-6"
    >
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <FieldGroup>
        <FormTextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <FormTextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        {errors.root && <FieldError errors={[errors.root]} />}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Please wait…" : "Sign in"}
        </Button>
      </FieldGroup>
      <Link href="/auth/sign-up" className="text-sm underline">
        No account yet? Sign up
      </Link>
    </form>
  )
}

export { SignInForm }
