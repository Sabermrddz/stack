/**
 * Neon + Drizzle ORM client.
 *
 * Uses the HTTP driver (`neon-http`) which is ideal for serverless/edge
 * runtimes (Vercel, Appwrite Sites). Each query is a single HTTPS fetch —
 * no persistent TCP connection needed.
 *
 * For migrations, use DATABASE_URL_UNPOOLED (the direct/unpooled connection
 * string from your Neon dashboard) in drizzle.config.ts.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/env";
import * as schema from "@/db/schema";

const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
export type Db = typeof db;
