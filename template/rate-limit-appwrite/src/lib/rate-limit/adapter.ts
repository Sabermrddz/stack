/**
 * Rate limiter adapter interface.
 *
 * Implementations: MongoRateLimitAdapter, PostgresRateLimitAdapter,
 * AppwriteRateLimitAdapter — see ./adapters/.
 *
 * Usage pattern (in any API route or server action):
 *   import { getRateLimiter } from "@/lib/rate-limit";
 *   const limiter = getRateLimiter();
 *   const result = await limiter.limit({ key: `${ip}:/api/my-route` });
 *   if (!result.success) return Response.json({ error: "Too many requests" }, { status: 429 });
 */

export interface RateLimitResult {
  /** true = request allowed; false = rate-limit exceeded */
  success: boolean;
  /** Approximate seconds until the window resets */
  resetIn: number;
}

export interface RateLimitAdapter {
  /**
   * Increment the counter for `key` and check it against `max` within `window`
   * seconds. The sliding or fixed window implementation is up to the adapter.
   */
  limit(opts: {
    /** Unique key, e.g. `${ip}:${route}` */
    key: string;
    /** Max requests in the window */
    max: number;
    /** Window duration in seconds */
    window: number;
  }): Promise<RateLimitResult>;
}
