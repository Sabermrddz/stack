"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

type Provider = "google" | "github";

const btnCls =
  "flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black/[.08] px-5 text-sm font-medium text-black transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/[.06]";

export function SignInButtons() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: Provider) => {
    setPending(provider);
    setError(null);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
    if (error) {
      setPending(null);
      setError(error.message ?? "Sign in failed, please try again.");
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        className={btnCls}
        disabled={pending !== null}
        onClick={() => void signIn("google")}
      >
        Sign in with Google
      </button>
      <button
        type="button"
        className={btnCls}
        disabled={pending !== null}
        onClick={() => void signIn("github")}
      >
        Sign in with GitHub
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
