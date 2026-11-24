import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC = ["/login", "/forgot-password", "/auth/confirm"];

/** Refreshes the session cookie and sends signed-out visitors to /login. Real authorization is RLS + server checks. */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPublic = PUBLIC.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!url || !anon) return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookieOptions: { name: "sb-admin", path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, httpOnly: true }));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isPublic) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)"] };
