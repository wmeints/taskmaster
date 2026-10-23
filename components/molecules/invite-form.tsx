"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlusIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { inviteSchema, type InviteValues } from "@/lib/sharing/schemas"

// Invites one or more people to a list by email; the field empties once they're invited.
function InviteForm({ onInvite }: { onInvite: (values: InviteValues) => Promise<{ error: string } | void> }) {
  const id = useId()
  const form = useForm<InviteValues, unknown, z.output<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { emails: "" },
  })

  async function onSubmit({ emails }: z.output<typeof inviteSchema>) {
    // Hand on the cleaned-up addresses; the server parses them with the same schema.
    const result = await onInvite({ emails: emails.join(", ") })
    if (result && "error" in result) {
      form.setError("emails", { message: result.error })
      return
    }
    form.reset()
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="emails"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={id} className="text-sm font-medium">
              Invite by email
            </FieldLabel>
            <div className="flex gap-2 max-sm:flex-col">
              <Input
                {...field}
                id={id}
                inputMode="email"
                autoComplete="off"
                placeholder="name@example.com"
                aria-invalid={fieldState.invalid}
                className="h-10 flex-1"
              />
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-10 px-3.5">
                <UserPlusIcon aria-hidden />
                {form.formState.isSubmitting ? "Sending…" : "Send invite"}
              </Button>
            </div>
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : (
              <FieldDescription className="text-xs">
                Separate several addresses with commas. Press Enter to send.
              </FieldDescription>
            )}
          </Field>
        )}
      />
    </form>
  )
}

export { InviteForm }
