import { redirect } from "next/navigation";
import type { ProfileRow } from "@/shared/src/supabase/database.types.ts";
import { isConfigured } from "./env";
import { getSupabase } from "./supabase";

export const ALLOWED_ROLES: ProfileRow["role"][] = ["MODERATOR", "ADMIN"];

/** The signed-in user's profile, or null. Roles come from the database, never from user-editable metadata. */
export async function getProfile(): Promise<ProfileRow | null> {
  if (!isConfigured) return null;
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

/** Page guard: redirects to /login unless a user with an allowed role is signed in. */
export async function requireProfile(): Promise<ProfileRow> {
  const p = await getProfile();
  if (!p || !ALLOWED_ROLES.includes(p.role)) redirect("/login");
  return p;
}
