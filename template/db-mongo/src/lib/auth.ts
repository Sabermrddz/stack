import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

import { createBetterAuth, getSessionFromHeaders } from "@/lib/auth-core";
import { connectToDatabase } from "@/lib/db";

function buildAuth(connection: mongoose.Connection) {
  const db = connection.db;
  if (!db) throw new Error("MongoDB is not connected yet");

  return createBetterAuth(mongodbAdapter(db, { transaction: false }));
}

type Auth = ReturnType<typeof buildAuth>;
let authPromise: Promise<Auth> | null = null;

/**
 * Lazily initialise the Better-Auth instance after MongoDB connects.
 * Cached for the process lifetime; resets on connection errors.
 */
export function getAuth(): Promise<Auth> {
  authPromise ??= connectToDatabase()
    .then(() => buildAuth(mongoose.connection))
    .catch((err) => {
      authPromise = null;
      throw err;
    });
  return authPromise;
}

export async function getCurrentSession() {
  const auth = await getAuth();
  return getSessionFromHeaders(auth);
}
