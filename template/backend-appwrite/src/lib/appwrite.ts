/**
 * Appwrite server-side client setup for Next.js App Router SSR.
 *
 * Two client types:
 *  - Admin client: uses API key — for operations that bypass user permissions
 *    (account creation, server-triggered actions).
 *  - Session client: uses the user's session cookie — for all user-scoped
 *    requests (reading/writing their own data, file uploads, etc.).
 *
 * The session cookie name follows Appwrite's convention:
 *   `a_session_<projectId-lowercase>`
 */

import { Account, Client, Storage, TablesDB } from "node-appwrite";
import { cookies } from "next/headers";

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? "";
const API_KEY = process.env.APPWRITE_API_KEY ?? "";

export const SESSION_COOKIE = `a_session_${PROJECT}`;

// ── Admin client (server-side, uses API key) ──────────────────────────────────

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT)
    .setKey(API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get storage() {
      return new Storage(client);
    },
    get tablesDb() {
      return new TablesDB(client);
    },
    client,
  };
}

// ── Session client (user-scoped, uses session cookie) ─────────────────────────

export async function createSessionClient() {
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    throw new Error("No active session");
  }

  client.setSession(sessionCookie.value);

  return {
    get account() {
      return new Account(client);
    },
    get storage() {
      return new Storage(client);
    },
    get tablesDb() {
      return new TablesDB(client);
    },
    client,
  };
}

// ── Convenience: get current user (returns null if not signed in) ─────────────

export async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}
