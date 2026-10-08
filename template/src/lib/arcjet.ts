import createArcjet, {
  cloudflare,
  detectBot,
  fixedWindow,
  shield,
} from "@arcjet/next";

import { env } from "@/env";

/**
 * Base Arcjet client: Shield + bot detection + a generous global rate limit.
 *
 * Add route-specific rules with `arcjet.withRule(...)`, e.g. a tighter
 * rate limit for the auth endpoints.
 */
export const arcjet = createArcjet({
  key: env.ARCJET_KEY,
  proxies: [cloudflare()],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    fixedWindow({ mode: "LIVE", window: "60s", max: 100 }),
  ],
});
