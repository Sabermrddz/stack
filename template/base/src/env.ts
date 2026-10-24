import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Base env schema — variables shared by every stack.
 * Stack-specific overlays extend this via re-export in their own env.ts.
 */
export const env = createEnv({
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    TURNSTILE_SECRET_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
});

export type Env = typeof env;
