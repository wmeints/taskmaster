import { Suspense } from "react";
import { SignUpForm } from "@/components/organisms/sign-up-form";
import { CenteredTemplate } from "@/components/templates/centered-template";
import { signUpWithEmail } from "../actions";

export default function SignUpPage({ searchParams }: PageProps<"/auth/sign-up">) {
  // The empty form is the static shell; the landing page's email prefill streams in at request time.
  return (
    <CenteredTemplate>
      <Suspense fallback={<SignUpForm action={signUpWithEmail} />}>
        <PrefilledSignUpForm searchParams={searchParams} />
      </Suspense>
    </CenteredTemplate>
  );
}

async function PrefilledSignUpForm({ searchParams }: Pick<PageProps<"/auth/sign-up">, "searchParams">) {
  const { email } = await searchParams;
  return (
    <SignUpForm
      action={signUpWithEmail}
      defaultEmail={typeof email === "string" ? email : undefined}
    />
  );
}
