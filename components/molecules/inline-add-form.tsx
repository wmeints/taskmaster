"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CornerDownLeftIcon, PlusIcon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { cn } from "cn"

import { RecognisedBar, type Recognised } from "@/components/molecules/recognised-bar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import type { newTaskSchema, NewTaskValues } from "@/lib/tasks/schemas"

// A one-line form that adds an item on Enter and stays focused for the next one. Given recognise, it
// shows the deadline and list read from the title under the field as the user types.
function InlineAddForm({
  label,
  placeholder,
  schema,
  onAdd,
  inputRef,
  variant = "solid",
  recognise,
}: {
  label: string
  placeholder: string
  // Any schema with a single title field, such as the task and subtask schemas.
  schema: typeof newTaskSchema
  onAdd: (values: NewTaskValues) => Promise<{ error: string } | unknown>
  inputRef?: React.RefObject<HTMLInputElement | null>
  variant?: "solid" | "dashed"
  recognise?: (title: string) => Recognised
}) {
  const id = useId()
  const form = useForm<NewTaskValues>({ resolver: zodResolver(schema), defaultValues: { title: "" } })
  const title = useWatch({ control: form.control, name: "title" })
  const recognised = recognise?.(title)

  async function onSubmit(values: NewTaskValues) {
    const result = await onAdd(values)
    if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
      form.setError("title", { message: result.error })
      return
    }
    form.reset()
  }

  return (
    <form method="post" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel htmlFor={id} className="sr-only">
              {label}
            </FieldLabel>
            <InputGroup
              className={cn(
                "h-11 bg-background",
                variant === "dashed" && "h-10 border-dashed shadow-none"
              )}
            >
              <InputGroupAddon>
                <PlusIcon aria-hidden className="ml-1 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                {...field}
                ref={(element) => {
                  field.ref(element)
                  if (inputRef) inputRef.current = element
                }}
                id={id}
                placeholder={placeholder}
                autoComplete="off"
                aria-invalid={fieldState.invalid}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    form.reset()
                    event.currentTarget.blur()
                  }
                }}
              />
              {variant === "solid" && (
                <InputGroupAddon align="inline-end" className="mr-1 gap-1.5 text-xs">
                  <Kbd className="border bg-background">
                    <CornerDownLeftIcon aria-hidden />
                  </Kbd>
                  add
                </InputGroupAddon>
              )}
            </InputGroup>
            {recognised && (recognised.deadline || recognised.list || recognised.newList) && (
              <RecognisedBar {...recognised} variant="inline" />
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  )
}

export { InlineAddForm }
