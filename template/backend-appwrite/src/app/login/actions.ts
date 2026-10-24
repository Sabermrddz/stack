"use server";

import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient, SESSION_COOKIE } from "@/lib/appwrite";
import { verifyTurnstile } from "@/lib/turnstile";

export type AuthState = { error?: string };

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(1).max(128),
});

// ── Sign In ────────────────────────────────────────────────────────────────────

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = formData.get("turnstileToken");
  const captchaOk = await verifyTurnstile(typeof token === "string" ? token : "");
  if (!captchaOk) {
    return { error: "Captcha verification failed. Please complete the challenge." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and a password of 8+ characters." };
  }

  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password,
    );

    (await cookies()).set(SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(session.expire),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign-in failed.";
    return { error: msg };
  }

  redirect("/dashboard");
}

// ── Sign Up ────────────────────────────────────────────────────────────────────

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = formData.get("turnstileToken");
  const captchaOk = await verifyTurnstile(typeof token === "string" ? token : "");
  if (!captchaOk) {
    return { error: "Captcha verification failed. Please complete the challenge." };
  }

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const { account } = await createAdminClient();
    await account.create(
      ID.unique(),
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
    );
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password,
    );

    (await cookies()).set(SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(session.expire),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sign-up failed.";
    return { error: msg };
  }

  redirect("/dashboard");
}

// ── Sign Out ───────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  try {
    const { createSessionClient } = await import("@/lib/appwrite");
    const { account } = await createSessionClient();
    await account.deleteSession("current");
  } catch {
    // Session may already be expired — continue to clear cookie
  }

  (await cookies()).set(SESSION_COOKIE, "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });

  redirect("/login");
}
