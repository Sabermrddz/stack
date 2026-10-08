"use server";

import { request } from "@arcjet/next";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { arcjet } from "@/lib/arcjet";
import { getAuth } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

export type SignInState = {
  error?: string;
};

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const req = await request();

  const decision = await arcjet.protect(req);
  if (decision.isDenied()) {
    return { error: "Too many attempts. Please try again later." };
  }

  const token = formData.get("turnstileToken");
  const captchaOk = await verifyTurnstile(
    typeof token === "string" ? token : "",
    req.ip,
  );

  if (!captchaOk) {
    return {
      error: "Captcha verification failed. Please complete the challenge.",
    };
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
      headers: await headers(),
    });
  } catch (err) {
    if (isAPIError(err)) {
      return { error: err.message || "Invalid email or password." };
    }
    throw err;
  }

  redirect("/dashboard");
}
