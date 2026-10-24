import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { createBetterAuth, getSessionFromHeaders } from "@/lib/auth-core";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";

/**
 * Better-Auth instance wired to Drizzle + Neon (PostgreSQL).
 *
 * The Drizzle adapter with provider "pg" maps Better-Auth's internal model
 * names to the Drizzle schema tables defined in src/db/schema.ts.
 */
const auth = createBetterAuth(
  drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      rateLimit: schema.rateLimit,
    },
  }),
);

export function getAuth() {
  return Promise.resolve(auth);
}

export async function getCurrentSession() {
  return getSessionFromHeaders(auth);
}
