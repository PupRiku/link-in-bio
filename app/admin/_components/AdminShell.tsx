"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";

import { signOut } from "@/lib/auth-actions";
import {
  AnalyticsIcon,
  BurgerIcon,
  CloseIcon,
  DashboardIcon,
  EventsIcon,
  LinksIcon,
  ProfileIcon,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon },
  { href: "/admin/links", label: "Links", Icon: LinksIcon },
  { href: "/admin/events", label: "Events", Icon: EventsIcon },
  { href: "/admin/profile", label: "Profile", Icon: ProfileIcon },
  { href: "/admin/analytics", label: "Analytics", Icon: AnalyticsIcon },
];

export default function AdminShell({
  userName,
  userHandle,
  children,
}: {
  userName: string;
  userHandle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes (e.g. a nav tap).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const avatarLetter = (userName.trim()[0] ?? "R").toUpperCase();

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-base text-bone">
      <div
        data-drawer={drawerOpen ? "open" : "closed"}
        className="group/app relative mx-auto flex min-h-screen w-full min-w-0 max-w-[1240px] flex-col bg-base min-[861px]:grid min-[861px]:grid-cols-[236px_1fr]"
      >
        {/* SIDEBAR (static on desktop, slide-in drawer on mobile) */}
        <aside
          id="admin-sidebar"
          className="fixed inset-y-0 left-0 z-50 flex w-[266px] -translate-x-full flex-col border-r border-line bg-panel px-3.5 py-5 transition-transform duration-[260ms] ease-out after:absolute after:right-[-1px] after:top-0 after:h-[120px] after:w-px after:bg-gradient-to-b after:from-teal after:to-transparent after:opacity-50 after:content-[''] motion-reduce:transition-none group-data-[drawer=open]/app:translate-x-0 min-[861px]:static min-[861px]:w-auto min-[861px]:translate-x-0 min-[861px]:px-4 min-[861px]:py-[22px]"
        >
          <div className="flex items-baseline gap-2 px-2.5 pb-[22px] pt-1">
            <span className="font-anton text-[26px] tracking-[0.01em] text-bone">
              RIKU
            </span>
            <span className="font-oswald text-[10px] uppercase tracking-[0.26em] text-teal">
              admin
            </span>
          </div>

          <nav className="flex flex-col gap-[3px]">
            {NAV.map(({ href, label, Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 font-oswald text-[13px] font-medium uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 ${
                    active
                      ? "bg-surface-2 text-bone"
                      : "text-mute hover:bg-surface hover:text-steel"
                  }`}
                >
                  {active ? (
                    <span className="absolute bottom-[9px] left-0 top-[9px] w-[3px] rounded-[2px] bg-teal shadow-[0_0_10px_var(--color-teal)]" />
                  ) : null}
                  <Icon className="h-[17px] w-[17px]" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-line pt-[18px]">
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-gradient-to-br from-oxblood-live to-[#3a0810] font-anton text-sm text-bone">
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <b className="block truncate text-[13px] font-medium leading-[1.1]">
                  {userName}
                </b>
                <span className="block truncate text-[11px] text-dim">
                  {userHandle}
                </span>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="mt-2 w-full rounded-[9px] border border-line-2 bg-transparent px-3 py-2 text-left font-oswald text-[12px] uppercase tracking-[0.08em] text-mute transition-colors hover:border-oxblood hover:text-oxblood-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/60"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 overflow-x-clip px-4 pb-11 pt-[18px] min-[861px]:px-8 min-[861px]:pb-12 min-[861px]:pt-[26px]">
          <div className="sticky top-0 z-20 -mx-4 -mt-[18px] mb-4 flex items-center justify-between border-b border-line bg-base px-4 py-3 min-[861px]:hidden">
            <div className="flex items-baseline gap-2">
              <span className="font-anton text-[22px] text-bone">RIKU</span>
              <span className="font-oswald text-[9px] uppercase tracking-[0.26em] text-teal">
                admin
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-expanded={drawerOpen}
              aria-controls="admin-sidebar"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line-2 text-steel transition-colors hover:border-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60"
            >
              {drawerOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <BurgerIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {children}
        </main>

        {/* SCRIM (mobile only) */}
        <div
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 bg-black/60 opacity-0 transition-opacity duration-[220ms] motion-reduce:transition-none group-data-[drawer=open]/app:pointer-events-auto group-data-[drawer=open]/app:opacity-100 min-[861px]:hidden"
        />
      </div>
    </div>
  );
}
