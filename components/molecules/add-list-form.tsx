"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { listSchema, type ListValues } from "@/lib/tasks/schemas"

// Names a new list inline in the sidebar; Escape or leaving it empty cancels.
function AddListForm({
  onAdd,
  onCancel,
}: {
  onAdd: (values: ListValues) => Promise<{ error: string } | unknown>
  onCancel: () => void
}) {
  const id = useId()
  const form = useForm<ListValues>({ resolver: zodResolver(listSchema), defaultValues: { name: "" } })

  async function onSubmit(values: ListValues) {
    const result = await onAdd(values)
    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      form.setError("name", { message: result.error })
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="px-1">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel htmlFor={id} className="sr-only">
              List name
            </FieldLabel>
            <Input
              {...field}
              id={id}
              autoFocus
              autoComplete="off"
              placeholder="List name"
              aria-invalid={fieldState.invalid}
              onBlur={() => {
                field.onBlur()
                if (!field.value.trim()) onCancel()
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") onCancel()
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  )
}

export { AddListForm }
