import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AccountSummary } from "@/components/organisms/account-summary";
import { CenteredTemplate } from "@/components/templates/centered-template";
import { getCurrentAccount } from "@/lib/accounts";
import { signOut } from "../auth/actions";

export default function AccountPage() {
  return (
    <CenteredTemplate>
      <Suspense fallback={<p>Loading account…</p>}>
        <Account />
      </Suspense>
    </CenteredTemplate>
  );
}

async function Account() {
  // Defer to request time so prerendering stops here instead of inside the auth SDK.
  await connection();
  const account = await getCurrentAccount();
  if (!account) {
    redirect("/auth/sign-in");
  }

  return <AccountSummary account={account} signOutAction={signOut} />;
}
