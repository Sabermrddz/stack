/**
 * Appwrite rate-limit adapter (fixed window, lazy cleanup).
 *
 * Stores rate-limit counters as rows in an Appwrite TablesDB table called
 * "rate_limits". Expired rows are deleted on the next request for the same
 * key — no scheduled cleanup is required (compatible with free tier).
 *
 * Table schema (create once in the Appwrite console or via script):
 *   Table ID: rate_limits
 *   Columns:
 *     rl_key       text   required
 *     count        integer required default 0
 *     expires_at   integer required  (Unix timestamp in seconds)
 */

import type { RateLimitAdapter, RateLimitResult } from "./adapter";

// Appwrite SDK types — imported lazily so Next.js tree-shaking works
type AppwriteTablesDB = {
  listRows(opts: {
    databaseId: string;
    tableId: string;
    queries: string[];
  }): Promise<{ rows: Array<{ $id: string; count: number; expires_at: number }> }>;
  createRow(opts: {
    databaseId: string;
    tableId: string;
    rowId: string;
    data: { rl_key: string; count: number; expires_at: number };
    permissions?: string[];
  }): Promise<{ $id: string }>;
  updateRow(opts: {
    databaseId: string;
    tableId: string;
    rowId: string;
    data: Partial<{ count: number; expires_at: number }>;
  }): Promise<unknown>;
  deleteRow(opts: {
    databaseId: string;
    tableId: string;
    rowId: string;
  }): Promise<unknown>;
};

const TABLE_ID = "rate_limits";
const QUERY_EQUAL = (attr: string, val: string) =>
  `equal("${attr}", "${val}")`;

export class AppwriteRateLimitAdapter implements RateLimitAdapter {
  constructor(
    private readonly tablesDb: AppwriteTablesDB,
    private readonly databaseId: string,
  ) {}

  async limit({
    key,
    max,
    window,
  }: {
    key: string;
    max: number;
    window: number;
  }): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + window;

    const { rows } = await this.tablesDb.listRows({
      databaseId: this.databaseId,
      tableId: TABLE_ID,
      queries: [QUERY_EQUAL("rl_key", key)],
    });

    const existing = rows[0];

    // Lazy-delete expired row
    if (existing && existing.expires_at <= now) {
      await this.tablesDb.deleteRow({
        databaseId: this.databaseId,
        tableId: TABLE_ID,
        rowId: existing.$id,
      });

      // Treat as a new window
      await this.tablesDb.createRow({
        databaseId: this.databaseId,
        tableId: TABLE_ID,
        rowId: `${key.replace(/[^a-z0-9]/gi, "_")}_${now}`.slice(0, 36),
        data: { rl_key: key, count: 1, expires_at: expiresAt },
      });
      return { success: true, resetIn: window };
    }

    if (!existing) {
      await this.tablesDb.createRow({
        databaseId: this.databaseId,
        tableId: TABLE_ID,
        rowId: `${key.replace(/[^a-z0-9]/gi, "_")}_${now}`.slice(0, 36),
        data: { rl_key: key, count: 1, expires_at: expiresAt },
      });
      return { success: true, resetIn: window };
    }

    // Increment within existing window
    const newCount = existing.count + 1;
    await this.tablesDb.updateRow({
      databaseId: this.databaseId,
      tableId: TABLE_ID,
      rowId: existing.$id,
      data: { count: newCount },
    });

    const resetIn = Math.max(0, existing.expires_at - now);
    return { success: newCount <= max, resetIn };
  }
}
