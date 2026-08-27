import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root proxy — runs on every matched request.
 * Named 'proxy' as required by Next.js 16 proxy.ts convention.
 * (Previously 'middleware' in middleware.ts — deprecated in Next.js 16)
 *
 * Responsibilities:
 * 1. Refresh Supabase auth session (keeps tokens alive)
 * 2. Protect all /admin/* routes (redirect to /admin/login if unauthenticated)
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};

