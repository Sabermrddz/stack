"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuth } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

export type SignInState = { error?: string };

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

/**
 * Server action for email/password sign-in.
 * Validates Turnstile token, then delegates to Better-Auth.
 * Better-Auth's built-in rate limiter applies at the /sign-in/email endpoint.
 */
export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const token = formData.get("turnstileToken");
  const captchaOk = await verifyTurnstile(
    typeof token === "string" ? token : "",
    ip,
  );

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

  const auth = await getAuth();

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: h,
    });
  } catch (err) {
    if (isAPIError(err)) {
      return { error: err.message || "Invalid email or password." };
    }
    throw err;
  }

  redirect("/dashboard");
}
