"use client";

import { useActionState, useState } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";

import { signInAction, signUpAction, type AuthState } from "./actions";

const inputCls =
  "h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-3 text-sm text-black outline-none transition-colors focus:border-black/[.2] dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/[.3]";

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInFormAction, signInPending] = useActionState<AuthState, FormData>(
    signInAction,
    {},
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState<AuthState, FormData>(
    signUpAction,
    {},
  );
  const [token, setToken] = useState("");

  const isSignIn = mode === "signin";
  const action = isSignIn ? signInFormAction : signUpFormAction;
  const pending = isSignIn ? signInPending : signUpPending;
  const state = isSignIn ? signInState : signUpState;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-lg border border-black/[.08] p-1 dark:border-white/[.145]">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <form action={action} className="flex flex-col gap-4">
        {!isSignIn && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className={inputCls}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete={isSignIn ? "current-password" : "new-password"}
            className={inputCls}
          />
        </label>

        <TurnstileWidget onVerify={setToken} />
        <input type="hidden" name="turnstileToken" value={token} />

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-[#ccc]"
        >
          {pending
            ? isSignIn
              ? "Signing in…"
              : "Creating account…"
            : isSignIn
              ? "Sign in"
              : "Create account"}
        </button>

        {state.error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
