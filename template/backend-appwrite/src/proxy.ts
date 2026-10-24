import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/appwrite";

const SENSITIVE_PATH =
  /(^|\/)\.((env|git|svn|hg|htpasswd|htaccess))|\.((env|pem|key|p12|log|sql|bak))$/i;

const PROTECTED_PATHS = ["/dashboard"];

/**
 * Proxy (middleware) for the Appwrite stack.
 * Uses the Appwrite session cookie for an optimistic auth guard.
 * The page itself always re-validates by calling account.get() server-side.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SENSITIVE_PATH.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    PROTECTED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    ) &&
    !request.cookies.has(SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
