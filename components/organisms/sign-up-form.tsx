"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormTextField } from "@/components/molecules/form-text-field"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { signUpSchema, type SignUpValues } from "@/lib/auth/schemas"

function SignUpForm({
  action,
  defaultEmail = "",
}: {
  action: (values: SignUpValues) => Promise<{ error: string } | undefined>
  defaultEmail?: string
}) {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: defaultEmail, password: "" },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: SignUpValues) {
    const result = await action(values)
    if (result?.error) {
      form.setError("root", { message: result.error })
    }
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-6"
    >
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <FieldGroup>
        <FormTextField control={form.control} name="name" label="Name" autoComplete="name" />
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
          autoComplete="new-password"
        />
        {errors.root && <FieldError errors={[errors.root]} />}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Please wait…" : "Sign up"}
        </Button>
      </FieldGroup>
      <Link href="/auth/sign-in" className="text-sm underline">
        Already have an account? Sign in
      </Link>
    </form>
  )
}

export { SignUpForm }
