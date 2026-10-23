import { z } from "zod"

const title = (error: string) =>
  z.string().trim().min(1, { error }).max(500, { error: "Keep it under 500 characters" })

const description = z.string().trim().max(5000, { error: "Keep it under 5000 characters" })

export const newTaskSchema = z.object({ title: title("Enter a task") })

export const taskDetailsSchema = z.object({ title: title("Enter a title"), description })

export const subtaskSchema = z.object({ title: title("Enter a subtask") })

export const listSchema = z.object({
  name: z.string().trim().min(1, { error: "Enter a list name" }).max(100, { error: "Keep it under 100 characters" }),
})

const due = z.object({
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
})

// Any subset of a task's editable fields; the server re-validates every change with this.
export const taskChangesSchema = z
  .object({
    title: title("Enter a title"),
    description,
    due: due.nullable(),
    listId: z.uuid().nullable(),
    completed: z.boolean(),
  })
  .partial()

export const scopeSchema = z.union([
  z.object({ view: z.enum(["inbox", "today", "tomorrow", "end-of-week", "later"]) }),
  z.object({ listId: z.uuid() }),
])

export type NewTaskValues = z.infer<typeof newTaskSchema>
export type TaskDetailsValues = z.infer<typeof taskDetailsSchema>
export type SubtaskValues = z.infer<typeof subtaskSchema>
export type ListValues = z.infer<typeof listSchema>
export type TaskChanges = z.infer<typeof taskChangesSchema>
