"use client";

import { useActionState, useState } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";

import { signInAction, type SignInState } from "./actions";

const inputClassName =
  "h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm text-black outline-none transition-colors focus:border-black/[.2] dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/[.3]";

export function EmailForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signInAction,
    {},
  );
  const [token, setToken] = useState("");

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Password
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          className={inputClassName}
        />
      </label>

      <TurnstileWidget onVerify={setToken} />
      <input type="hidden" name="turnstileToken" value={token} />

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-[#ccc]"
      >
        {pending ? "Signing in…" : "Sign in with email"}
      </button>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
