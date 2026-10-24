import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ExampleUpload } from "@/components/example-upload";
import { getCurrentSession } from "@/lib/auth";

import { SignOutButton } from "./sign-out-button";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.145] dark:bg-black">
        <Suspense
          fallback={
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading your dashboard…
            </p>
          }
        >
          <Dashboard />
        </Suspense>
      </main>
    </div>
  );
}

async function Dashboard() {
  // Defer to request time so the build never needs a live DB connection.
  await connection();

  const session = await getCurrentSession();

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Welcome, {session.user.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {session.user.email}
        </p>
      </div>

      <div className="border-t border-black/[.08] pt-6 dark:border-white/[.145]">
        <ExampleUpload />
      </div>

      <SignOutButton />
    </div>
  );
}
