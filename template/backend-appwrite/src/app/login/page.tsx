import type { Metadata } from "next";

import { AuthForm } from "./auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Welcome
        </h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Sign in or create an account to continue.
        </p>
        <AuthForm />
      </main>
    </div>
  );
}
