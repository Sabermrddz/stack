import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";

import { env } from "@/env";

/**
 * Better-Auth instance factory.
 * The database adapter is injected by the db-specific overlay (db-mongo or db-postgres).
 * This file is the shared auth configuration; do NOT import it directly —
 * use the stack-specific auth.ts in db-mongo/ or db-postgres/ instead.
 */
export function createBetterAuth(
  database: Parameters<typeof betterAuth>[0]["database"],
) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database,
    emailAndPassword: { enabled: true },
    /**
     * Built-in rate limiting for auth endpoints.
     * Uses "database" storage so counts survive serverless cold-starts.
     * Applies to /sign-in/email, /sign-up/email, /forget-password etc.
     *
     * Verified in Better-Auth docs: rateLimit.storage = "database" stores
     * counters in the same database as the adapter, using a "rateLimit" model.
     */
    rateLimit: {
      enabled: true,
      window: 60,   // 60-second window
      max: 10,      // 10 auth requests per window per IP
      storage: "database" as const,
      customRules: {
        "/sign-in/email":   { window: 60, max: 5 },
        "/sign-up/email":   { window: 60, max: 5 },
        "/forget-password": { window: 60, max: 3 },
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createBetterAuth>;

/**
 * Get the current session using the request headers.
 * Must be called in a Server Component or Server Action.
 */
export async function getSessionFromHeaders(auth: Auth) {
  return auth.api.getSession({ headers: await headers() });
}
