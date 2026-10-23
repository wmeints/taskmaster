import { Button } from "@/components/ui/button"
import type { Account } from "@/lib/accounts"

function AccountSummary({
  account,
  signOutAction,
}: {
  account: Account
  signOutAction: () => Promise<void>
}) {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Signed in as {account.name}</h1>
      <p data-testid="email">{account.email}</p>
      <p data-testid="db-created-at">
        Account created (from Postgres): {account.createdAt?.toISOString() ?? "not found"}
      </p>
      {/* A field-less form: no input to validate, so it posts straight to the server action. */}
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </section>
  )
}

export { AccountSummary }
