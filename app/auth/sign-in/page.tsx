import { signInWithEmail } from "../actions";
import { AuthForm } from "../auth-form";

export default function SignInPage() {
  return <AuthForm mode="sign-in" action={signInWithEmail} />;
}
