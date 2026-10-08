import mongoose from "mongoose";

import { env } from "@/env";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithCache = globalThis as typeof globalThis & {
  __mongooseCache?: CachedConnection;
};

const cache: CachedConnection = globalWithCache.__mongooseCache ?? {
  conn: null,
  promise: null,
};

globalWithCache.__mongooseCache = cache;

/**
 * Connect to MongoDB, reusing the connection across hot reloads in dev
 * and across invocations in serverless environments.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
