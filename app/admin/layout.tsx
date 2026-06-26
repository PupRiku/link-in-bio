import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: "RIKU admin",
  robots: { index: false, follow: false },
};

// Authoritative gate for the entire admin area. Every /admin/* render
// passes through here and re-verifies session + allowlist server-side.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-3">
          <span className="text-sm font-semibold tracking-tight">
            RIKU admin
          </span>
          <AdminNav />
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              View site ↗
            </a>
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {user.email ?? user.id.slice(0, 8)}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
