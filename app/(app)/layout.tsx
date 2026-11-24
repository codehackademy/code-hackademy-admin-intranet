import Image from "next/image";
import { AppShell, type NavItem } from "@/shared/src/ui/app-shell";
import { requireProfile } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";

const adminNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/cohorts", label: "Cohorts", icon: "cohorts" },
  { href: "/courses", label: "Courses", icon: "courses" },
  { href: "/users", label: "Users", icon: "users" },
  { href: "/interest", label: "Interest", icon: "interest" },
  { href: "/audit-log", label: "Audit log", icon: "audit" },
];
const moderatorNav: NavItem[] = [{ href: "/", label: "Overview", icon: "dashboard" }];

export const dynamic = "force-dynamic"; // always per-request: depends on the signed-in user

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const p = await requireProfile();
  return (
    <AppShell
      appLabel={p.role === "ADMIN" ? "Admin" : "Moderator"}
      logo={<Image src="/brand/logo.png" alt="Code Hackademy" width={1200} height={212} className="h-5 w-auto" />}
      nav={p.role === "ADMIN" ? adminNav : moderatorNav}
      userName={p.name}
      userMeta={p.role === "ADMIN" ? "Administrator" : "Moderator"}
      signOutAction={logout}
    >
      {children}
    </AppShell>
  );
}
