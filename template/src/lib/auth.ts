import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { env } from "@/env";
import { connectToDatabase } from "@/lib/db";

function createAuth(connection: mongoose.Connection) {
  const db = connection.db;

  if (!db) {
    throw new Error("MongoDB is not connected yet");
  }

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, { transaction: false }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;

let authPromise: Promise<Auth> | null = null;

/**
 * The auth instance is created lazily so the MongoDB connection is open
 * before the adapter runs. The instance is cached for the lifetime of the
 * process (safe with Next.js hot reload thanks to the module-level cache).
 */
export function getAuth(): Promise<Auth> {
  authPromise ??= connectToDatabase().then(() => createAuth(mongoose.connection));
  return authPromise;
}

export async function getCurrentSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}
