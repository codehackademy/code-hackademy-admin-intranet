"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, GraduationCap, Inbox, Layers, LayoutDashboard, LogOut, Menu, ScrollText, Users, X, type LucideIcon } from "lucide-react";
import { cn } from "./cn.ts";

/** Icons are referenced by name so server components can describe navigation as plain data. */
const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  cohorts: Layers,
  users: Users,
  audit: ScrollText,
  calendar: CalendarDays,
  student: GraduationCap,
  interest: Inbox,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

type Props = {
  appLabel: string;
  logo: React.ReactNode;
  nav: NavItem[];
  userName: string;
  userMeta?: string;
  /** Server action (or form action) used by the sign-out button. */
  signOutAction: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
};

function NavList({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {nav.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-ui px-3 text-sm font-semibold transition-colors",
                  active ? "bg-orange text-ink" : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarBody({ appLabel, logo, nav, userName, userMeta, signOutAction, onNavigate }: Omit<Props, "children"> & { onNavigate?: () => void }) {
  return (
    <div className="on-dark flex h-full flex-col gap-6 bg-ink p-4 text-white">
      <div className="space-y-3 px-1 pt-1">
        <div className="inline-block rounded-ui bg-white px-3 py-2">{logo}</div>
        <p className="font-mono text-xs uppercase tracking-widest text-orange">{appLabel}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList nav={nav} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-white/15 pt-4">
        <p className="truncate text-sm font-bold">{userName}</p>
        {userMeta ? <p className="truncate text-xs text-white/70">{userMeta}</p> : null}
        <form action={signOutAction} className="mt-3">
          <button type="submit" className="flex min-h-11 w-full items-center gap-2 rounded-ui px-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">
            <LogOut aria-hidden className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AppShell(props: Props) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();
  const { children, ...rest } = props;

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh lg:block">
        <SidebarBody {...rest} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="min-w-0">{props.logo}</div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => dialogRef.current?.showModal()}
            className="inline-flex size-11 items-center justify-center rounded-ui border-2 border-ink"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </header>

        <dialog
          ref={dialogRef}
          aria-label="Navigation"
          className="m-0 h-svh w-72 max-w-[85vw] bg-transparent p-0 backdrop:bg-ink/60"
          onClick={(e) => e.target === dialogRef.current && close()}
        >
          <div className="relative h-full">
            <SidebarBody {...rest} onNavigate={close} />
            <button type="button" aria-label="Close menu" onClick={close} className="on-dark absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-ui text-white hover:bg-white/10">
              <X aria-hidden className="size-5" />
            </button>
          </div>
        </dialog>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
