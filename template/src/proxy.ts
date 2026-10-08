import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic request protection, runs before the route renders.
 *
 * Note: Next.js 16 renamed `middleware.ts` to `proxy.ts` (same API).
 * Static assets are excluded via the matcher below.
 */

// Scanner/probe paths and sensitive files that should never be served.
const SENSITIVE_PATH =
  /(^|\/)\.(env|git|svn|hg|htpasswd|htaccess)|\.(env|pem|key|p12|log|sql|bak)$/i;

// Pages that require a session (optimistic cookie check only — the page
// itself always re-validates the session against the database).
const PROTECTED_PATHS = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SENSITIVE_PATH.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) &&
    !getSessionCookie(request)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, image optimization and favicons.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
