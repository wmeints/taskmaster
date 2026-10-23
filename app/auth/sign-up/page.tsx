import { Suspense } from "react";
import { signUpWithEmail } from "../actions";
import { AuthForm } from "../auth-form";

export default function SignUpPage({ searchParams }: PageProps<"/auth/sign-up">) {
  // The empty form is the static shell; the landing page's email prefill streams in at request time.
  return (
    <Suspense fallback={<AuthForm mode="sign-up" action={signUpWithEmail} />}>
      <PrefilledSignUpForm searchParams={searchParams} />
    </Suspense>
  );
}

async function PrefilledSignUpForm({ searchParams }: Pick<PageProps<"/auth/sign-up">, "searchParams">) {
  const { email } = await searchParams;
  return (
    <AuthForm
      mode="sign-up"
      action={signUpWithEmail}
      defaultEmail={typeof email === "string" ? email : undefined}
    />
  );
}
