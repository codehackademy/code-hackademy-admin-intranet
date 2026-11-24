import Image from "next/image";
import Link from "next/link";
import { AuthCard } from "@/shared/src/ui";
import { ActionForm, FormInput } from "@/shared/src/ui/action-form";
import { requestPasswordReset } from "@/lib/auth-actions";

export const metadata = { title: "Reset password" };

export default function ForgotPassword() {
  return (
    <AuthCard logo={<Image src="/brand/logo.png" alt="Code Hackademy" width={1200} height={212} priority className="h-7 w-auto" />} title="Reset your password" description="Enter your email and we'll send you a link.">
      <ActionForm action={requestPasswordReset} submitLabel="Send reset link" pendingLabel="Sending…">
        <FormInput name="email" label="Email" type="email" autoComplete="email" required />
      </ActionForm>
      <p className="mt-5 text-sm"><Link href="/login" className="font-bold underline">Back to sign in</Link></p>
    </AuthCard>
  );
}
