/**
 * PostgreSQL rate-limit adapter (sliding window via Drizzle ORM).
 *
 * Uses a `rate_limits` table. The table is created by Drizzle migrations
 * (schema defined in src/db/schema.ts). Expired rows are cleaned up lazily
 * on each call — no separate cron job required.
 *
 * Algorithm: sliding window — counts requests within the last `window` seconds.
 */

import { and, count, gt, lt, sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { RateLimitAdapter, RateLimitResult } from "./adapter";

// ── schema (re-exported so drizzle-kit picks it up in src/db/schema.ts) ─────
export const rateLimitsTable = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── adapter ──────────────────────────────────────────────────────────────────
// We import `db` lazily at runtime to avoid circular deps during build.

type DrizzleDb = Parameters<typeof count>[0] extends never
  ? // fallback type when count param is not generic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any;

export class PostgresRateLimitAdapter implements RateLimitAdapter {
  constructor(private readonly db: DrizzleDb) {}

  async limit({
    key,
    max,
    window,
  }: {
    key: string;
    max: number;
    window: number;
  }): Promise<RateLimitResult> {
    const db = this.db;
    const now = new Date();
    const windowStart = new Date(now.getTime() - window * 1000);

    // 1. Record this request
    await db.insert(rateLimitsTable).values({ key, requestedAt: now });

    // 2. Delete expired rows for this key (lazy cleanup)
    await db
      .delete(rateLimitsTable)
      .where(
        and(
          sql`${rateLimitsTable.key} = ${key}`,
          lt(rateLimitsTable.requestedAt, windowStart),
        ),
      );

    // 3. Count requests in window
    const [row] = await db
      .select({ total: count() })
      .from(rateLimitsTable)
      .where(
        and(
          sql`${rateLimitsTable.key} = ${key}`,
          gt(rateLimitsTable.requestedAt, windowStart),
        ),
      );

    const total = row?.total ?? 1;
    const resetIn = window;

    return { success: total <= max, resetIn };
  }
}
