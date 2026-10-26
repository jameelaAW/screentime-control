import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages anyone may open without signing in. API routes enforce their own rules.
const isPublic = (path: string) =>
  path === "/login" || path === "/forgot-password" || path === "/help" || path === "/manifest.webmanifest" || path.startsWith("/pwa-icon/") || path.startsWith("/auth/") || path.startsWith("/api/");

function redirectTo(request: NextRequest, path: string, from?: NextResponse) {
  const target = request.nextUrl.clone();
  target.pathname = path;
  target.search = "";
  const redirect = NextResponse.redirect(target);
  from?.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Not configured (e.g. a fresh clone): nothing to authenticate against.
  if (!url || !anonKey) return response;

  const path = request.nextUrl.pathname;
  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    // Also refreshes the session so it doesn't expire while the caregiver is active.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !isPublic(path)) return redirectTo(request, "/login", response);
    if (user && path === "/login") return redirectTo(request, "/", response);
    return response;
  } catch {
    // Fail closed: if we can't verify the session, don't show private pages.
    return isPublic(path) ? response : redirectTo(request, "/login");
  }
}
