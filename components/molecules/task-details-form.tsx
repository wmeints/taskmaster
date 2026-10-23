"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { taskDetailsSchema, type TaskDetailsValues } from "@/lib/tasks/schemas"

// A task's title and description, saved whenever a changed field loses focus.
function TaskDetailsForm({
  title,
  description,
  onSave,
}: {
  title: string
  description: string
  onSave: (values: TaskDetailsValues) => Promise<{ error: string } | unknown>
}) {
  const titleId = useId()
  const descriptionId = useId()
  const form = useForm<TaskDetailsValues>({
    resolver: zodResolver(taskDetailsSchema),
    defaultValues: { title, description },
  })
  // Reading isDirty here subscribes to it; formState only tracks what render reads.
  const { errors, isDirty } = form.formState

  async function onSubmit(values: TaskDetailsValues) {
    const result = await onSave(values)
    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      form.setError("root", { message: result.error })
      return
    }
    form.reset(values)
  }

  function saveIfChanged() {
    if (isDirty) {
      void form.handleSubmit(onSubmit)()
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={titleId}>Title</FieldLabel>
              <Input
                {...field}
                id={titleId}
                autoComplete="off"
                className="h-10 text-base font-semibold"
                aria-invalid={fieldState.invalid}
                onBlur={() => {
                  field.onBlur()
                  saveIfChanged()
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={descriptionId}>
                Description <span className="font-normal text-muted-foreground">· optional</span>
              </FieldLabel>
              <Textarea
                {...field}
                id={descriptionId}
                rows={3}
                className="min-h-24"
                aria-invalid={fieldState.invalid}
                onBlur={() => {
                  field.onBlur()
                  saveIfChanged()
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {errors.root && <FieldError errors={[errors.root]} />}
      </FieldGroup>
    </form>
  )
}

export { TaskDetailsForm }
