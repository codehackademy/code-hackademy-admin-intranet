import Image from "next/image";
import Link from "next/link";
import { AuthCard } from "@/shared/src/ui";
import { ActionForm, FormInput } from "@/shared/src/ui/action-form";
import { Alert } from "@/shared/src/ui";
import { login } from "@/lib/auth-actions";
import { isConfigured } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthCard logo={<Image src="/brand/logo.png" alt="Code Hackademy" width={1200} height={212} priority className="h-7 w-auto" />} title="Admin sign in" description="Sign in with the email and password for your Code Hackademy account.">
      {!isConfigured ? <Alert tone="warning" className="mb-5">Supabase isn&rsquo;t configured for this environment yet, so sign-in is unavailable.</Alert> : null}
      {error === "link" ? <Alert tone="danger" className="mb-5">That link is invalid or has expired. Ask for a new one.</Alert> : null}
      <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…">
        <FormInput name="email" label="Email" type="email" autoComplete="email" required />
        <FormInput name="password" label="Password" type="password" autoComplete="current-password" required />
      </ActionForm>
      <p className="mt-5 text-sm"><Link href="/forgot-password" className="font-bold underline">Forgot your password?</Link></p>
    </AuthCard>
  );
}
