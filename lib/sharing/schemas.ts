import { z } from "zod"

const maxInvites = 20

const email = z.email()

// Splits "a@x.com, B@x.com" into lower-case addresses, dropping blanks and repeats.
function splitEmails(value: string): string[] {
  return [...new Set(value.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean))]
}

// One or more addresses separated by commas; parses to the list of addresses.
export const inviteSchema = z.object({
  emails: z
    .string()
    .superRefine((value, ctx) => {
      const emails = splitEmails(value)
      const invalid = emails.find((address) => !email.safeParse(address).success)
      if (emails.length === 0) ctx.addIssue({ code: "custom", message: "Enter an email address" })
      else if (invalid) ctx.addIssue({ code: "custom", message: `“${invalid}” isn't a valid email address` })
      else if (emails.length > maxInvites) {
        ctx.addIssue({ code: "custom", message: `Invite at most ${maxInvites} people at a time` })
      }
    })
    .transform(splitEmails),
})

export type InviteValues = z.input<typeof inviteSchema>
