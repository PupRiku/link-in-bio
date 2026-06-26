import { redirect } from "next/navigation";

import { getSessionUser, isAllowedUser } from "@/lib/auth";
import LoginButton from "./LoginButton";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  forbidden: "That account isn't on the admin allowlist.",
  oauth: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Already signed in and authorized? Skip straight to the dashboard.
  const user = await getSessionUser();
  if (user && isAllowedUser(user)) redirect("/admin");

  const message = error ? MESSAGES[error] ?? "Something went wrong." : null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">RIKU admin</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Private. Sign in to manage links, events, and analytics.
          </p>
        </div>

        {message ? (
          <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        ) : null}

        <LoginButton />

        <p className="mt-6 text-center text-xs text-zinc-600">
          Access is restricted to allowlisted accounts.
        </p>
      </div>
    </div>
  );
}
