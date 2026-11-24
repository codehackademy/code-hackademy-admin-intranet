import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthCard } from "@/shared/src/ui";
import { ActionForm, FormInput } from "@/shared/src/ui/action-form";
import { setPassword } from "@/lib/auth-actions";
import { getSupabase } from "@/lib/supabase";
import { isConfigured } from "@/lib/env";

export const metadata = { title: "Set your password" };
export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  if (!isConfigured) redirect("/login");
  const { data: { user } } = await (await getSupabase()).auth.getUser();
  if (!user) redirect("/login?error=link");
  return (
    <AuthCard logo={<Image src="/brand/logo.png" alt="Code Hackademy" width={1200} height={212} priority className="h-7 w-auto" />} title="Set your password" description="Choose a password with at least 10 characters, including a number.">
      <ActionForm action={setPassword} submitLabel="Save password">
        <FormInput name="password" label="New password" type="password" autoComplete="new-password" required />
        <FormInput name="confirm" label="Confirm password" type="password" autoComplete="new-password" required />
      </ActionForm>
    </AuthCard>
  );
}
