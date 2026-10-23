"use client"

import { useId } from "react"
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type InputProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>

// A labeled text input bound to a react-hook-form field, with its validation error.
function FormTextField<TValues extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: {
  control: Control<TValues>
  name: FieldPath<TValues>
  label: string
} & InputProps) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input {...inputProps} {...field} id={id} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export { FormTextField }
