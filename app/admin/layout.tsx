import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import AdminShell from "./_components/AdminShell";

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

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const githubLogin =
    typeof meta.user_name === "string"
      ? meta.user_name
      : typeof meta.preferred_username === "string"
        ? meta.preferred_username
        : null;
  const userName =
    (typeof meta.name === "string" && meta.name) ||
    githubLogin ||
    user.email?.split("@")[0] ||
    "Admin";
  const userHandle = githubLogin
    ? `github / ${githubLogin}`
    : (user.email ?? user.id.slice(0, 8));

  return (
    <AdminShell userName={userName} userHandle={userHandle}>
      {children}
    </AdminShell>
  );
}
