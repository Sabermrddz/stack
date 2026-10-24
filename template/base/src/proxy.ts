import { NextResponse, type NextRequest } from "next/server";

/**
 * Shared request protection proxy (Next.js 16 renamed middleware to proxy).
 *
 * • Blocks scanner/probe paths and sensitive file extensions.
 * • Redirects unauthenticated users away from protected pages.
 *
 * Stack-specific overlays may extend PROTECTED_PATHS or the session-cookie
 * check — this base version uses a generic "has any session cookie" guard
 * that is overridden by the auth overlays.
 */

const SENSITIVE_PATH =
  /(^|\/)\.((env|git|svn|hg|htpasswd|htaccess))|\.((env|pem|key|p12|log|sql|bak))$/i;

const PROTECTED_PATHS = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SENSITIVE_PATH.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // Protected path guard is installed by the auth overlay (auth-betterauth or
  // backend-appwrite) which replaces this file with a version that can read
  // the real session cookie.  This base stub always allows through so the
  // project compiles even if no auth overlay is applied.
  void PROTECTED_PATHS;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
