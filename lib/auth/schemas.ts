import { z } from "zod"

const email = z.string().trim().pipe(z.email({ error: "Enter a valid email address" }))

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, { error: "Enter your name" }),
  email,
  password: z.string().min(8, { error: "Use at least 8 characters" }),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
