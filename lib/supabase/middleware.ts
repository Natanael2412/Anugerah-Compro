import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session in middleware.
 * Only runs for /admin routes — public routes pass through immediately.
 * Guards against missing env vars so landing page never crashes.
 */
export async function updateSession(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  // ── Short-circuit: public routes don't need Supabase at all ──
  if (!isAdminRoute) {
    return NextResponse.next({ request });
  }

  // ── Guard: graceful no-op if env vars are not set yet ────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project")) {
    console.warn("[proxy] Supabase env vars not set — admin routes are unprotected.");
    return NextResponse.next({ request });
  }

  // ── Normal flow: refresh session + protect /admin ─────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            options as Parameters<typeof supabaseResponse.cookies.set>[2]
          )
        );
      },
    },
  });

  // Refresh session — do not remove this line.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated → redirect to login
  if (!isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in on /admin/login → redirect to dashboard
  if (isLoginRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
