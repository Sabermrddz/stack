import type { Metadata } from "next";

import { EmailForm } from "./email-form";
import { SignInButtons } from "./sign-in-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Use one of the providers below to continue.
        </p>

        <div className="mt-8">
          <SignInButtons />
        </div>

        <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
          or
          <span className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
        </div>

        <EmailForm />
      </main>
    </div>
  );
}
