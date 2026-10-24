/**
 * MongoDB rate-limit adapter (fixed window).
 *
 * Uses a single `rate_limits` collection with a TTL index on `expiresAt` so
 * MongoDB automatically cleans up expired records — no cron job needed.
 *
 * TTL index creation (run once, or add to your DB init script):
 *   db.rate_limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
 */

import type { Collection, Db } from "mongodb";
import type { RateLimitAdapter, RateLimitResult } from "./adapter";

interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

let collection: Collection<RateLimitDoc> | null = null;

function getCollection(db: Db): Collection<RateLimitDoc> {
  if (!collection) {
    collection = db.collection<RateLimitDoc>("rate_limits");
    // Create TTL index lazily (idempotent — safe to call on each cold start).
    void collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }
  return collection;
}

export class MongoRateLimitAdapter implements RateLimitAdapter {
  constructor(private readonly db: Db) {}

  async limit({
    key,
    max,
    window,
  }: {
    key: string;
    max: number;
    window: number;
  }): Promise<RateLimitResult> {
    const col = getCollection(this.db);
    const now = Date.now();
    const windowMs = window * 1000;
    const expiresAt = new Date(now + windowMs);

    // Atomically increment counter. If the document doesn't exist, insert it
    // with count = 1 and TTL timestamp.
    const result = await col.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
      },
      { upsert: true, returnDocument: "after" },
    );

    const count = result?.count ?? 1;
    const resetIn = Math.ceil(
      ((result?.expiresAt?.getTime() ?? now + windowMs) - now) / 1000,
    );

    return { success: count <= max, resetIn: Math.max(0, resetIn) };
  }
}
