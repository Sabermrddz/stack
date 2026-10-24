import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth";

/**
 * Better-Auth catch-all API route.
 * All /api/auth/* requests are handled here.
 *
 * Rate limiting for auth endpoints is handled by Better-Auth's built-in
 * rateLimit config (see src/lib/auth-core.ts).
 */
export const { GET, POST } = toNextJsHandler(async (request) => {
  return (await getAuth()).handler(request);
});
