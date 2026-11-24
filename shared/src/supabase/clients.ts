import { createBrowserClient, createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Each web app has its own session: pass a distinct `cookieName` per app
 * (e.g. "sb-student", "sb-admin"). Cookies are host-only, never shared across subdomains (spec §18).
 */
export type AppSessionOptions = {
  url: string;
  anonKey: string;
  cookieName: string;
  secure?: boolean;
};

const cookieOptions = (o: AppSessionOptions) => ({
  name: o.cookieName,
  path: "/",
  sameSite: "lax" as const,
  secure: o.secure ?? true,
});

export function createSupabaseBrowserClient(o: AppSessionOptions): SupabaseClient {
  return createBrowserClient(o.url, o.anonKey, { cookieOptions: cookieOptions(o) });
}

export function createSupabaseServerClient(o: AppSessionOptions, cookies: CookieMethodsServer): SupabaseClient {
  return createServerClient(o.url, o.anonKey, { cookies, cookieOptions: cookieOptions(o) });
}

/** Cookie options for Supabase auth: HttpOnly is NOT set by @supabase/ssr in the browser; the server client sets it where supported. */
export type { CookieMethodsServer };
