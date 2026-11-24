import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/shared/src/supabase/clients.ts";
import { env } from "./env";

export const sessionOptions = { url: env.url, anonKey: env.anonKey, cookieName: "sb-admin", secure: process.env.NODE_ENV === "production" };

/** Server-side Supabase client acting as the signed-in user (RLS applies). Session cookies are HttpOnly and host-only. */
export async function getSupabase() {
  const store = await cookies();
  return createSupabaseServerClient(sessionOptions, {
    getAll: () => store.getAll(),
    setAll: (list) => {
      try { list.forEach(({ name, value, options }) => store.set(name, value, { ...options, httpOnly: true })); } catch { /* called from a Server Component: the proxy refreshes the session */ }
    },
  });
}
