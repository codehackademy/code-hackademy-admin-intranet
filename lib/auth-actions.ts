"use server";

import { redirect } from "next/navigation";
import { loginSchema, setPasswordSchema } from "@/shared/src/schemas/auth.ts";
import type { FormState } from "@/shared/src/ui/action-form";
import { ALLOWED_ROLES } from "./auth";
import { env, isConfigured } from "./env";
import { getSupabase } from "./supabase";

const NOT_CONFIGURED: FormState = { message: "This app isn't connected to Supabase yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." };

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return NOT_CONFIGURED;
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Check your email and password.", fieldErrors: parsed.error.flatten().fieldErrors };
  const sb = await getSupabase();
  const { data, error } = await sb.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: "Email or password is incorrect." }; // same message for every failure
  const { data: profile } = await sb.from("profiles").select("role, onboarded_at").eq("id", data.user.id).maybeSingle();
  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    await sb.auth.signOut();
    return { message: "This sign-in is for staff. Students should use the student intranet." };
  }
  redirect(profile.role === "STUDENT" && !profile.onboarded_at ? "/onboarding" : "/");
}

export async function logout(): Promise<void> {
  if (isConfigured) await (await getSupabase()).auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return NOT_CONFIGURED;
  const email = String(fd.get("email") ?? "").trim();
  if (email) await (await getSupabase()).auth.resetPasswordForEmail(email, { redirectTo: `${env.siteUrl}/auth/confirm?next=/set-password` });
  // Same response whether or not the account exists.
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function setPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return NOT_CONFIGURED;
  const parsed = setPasswordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const sb = await getSupabase();
  const { error } = await sb.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: "Your password couldn't be saved. Your link may have expired: request a new one." };
  redirect("/");
}
