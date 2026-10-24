import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment schema for the **postgres** stack.
 * Validates all required env vars at build time.
 * Set SKIP_ENV_VALIDATION=1 to bypass during CI/build with dummy values.
 */
export const env = createEnv({
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    // Neon PostgreSQL
    DATABASE_URL: z.string().min(1),
    DATABASE_URL_UNPOOLED: z.string().min(1),
    // Better-Auth
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    // OAuth
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    // Cloudflare Turnstile
    TURNSTILE_SECRET_KEY: z.string().min(1),
    // Backblaze B2
    B2_KEY_ID: z.string().min(1),
    B2_APPLICATION_KEY: z.string().min(1),
    B2_BUCKET: z.string().min(1),
    B2_ENDPOINT: z.string().min(1),
    B2_REGION: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
});

export type Env = typeof env;
