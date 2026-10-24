"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/login/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void signOutAction())}
      className="flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-[#ccc]"
    >
      Sign out
    </button>
  );
}
