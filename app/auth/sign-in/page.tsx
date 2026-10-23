import { SignInForm } from "@/components/organisms/sign-in-form";
import { CenteredTemplate } from "@/components/templates/centered-template";
import { signInWithEmail } from "../actions";

export default function SignInPage() {
  return (
    <CenteredTemplate>
      <SignInForm action={signInWithEmail} />
    </CenteredTemplate>
  );
}
