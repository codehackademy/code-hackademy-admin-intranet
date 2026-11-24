import Link from "next/link";
import { Badge, buttonVariants, EmptyState, PageHeader } from "@/shared/src/ui";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Users" };
const FILTERS = [["", "All"], ["STUDENT", "Students"], ["MODERATOR", "Moderators"], ["ADMIN", "Admins"]] as const;

export default async function Users({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  await requireAdmin();
  const { role } = await searchParams;
  let q = (await getSupabase()).from("profiles").select("id, name, email, role, status, github_username, onboarded_at").order("created_at", { ascending: false }).limit(200);
  if (role && ["STUDENT", "MODERATOR", "ADMIN"].includes(role)) q = q.eq("role", role);
  const { data } = await q;
  const invite = <Link href="/users/invite" className={buttonVariants()}>Invite user</Link>;
  return (
    <>
      <PageHeader title="Users" description="Accounts are created by invitation only." actions={invite} />
      <nav aria-label="Filter by role" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([v, l]) => (<Link key={v} href={v ? `/users?role=${v}` : "/users"} aria-current={(role ?? "") === v ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-sm font-bold ${(role ?? "") === v ? "bg-ink text-white" : "bg-white"}`}>{l}</Link>))}
      </nav>
      {!data?.length ? <EmptyState title="No users found" action={invite}>Invite students and moderators by email.</EmptyState> : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-paper text-steel"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">GitHub</th></tr></thead>
            <tbody className="divide-y divide-line">{data.map((u) => (
              <tr key={u.id}><td className="px-4 py-3"><p className="font-bold">{u.name}</p><p className="text-xs text-steel">{u.email}</p></td><td className="px-4 py-3"><Badge tone="brand">{u.role}</Badge></td>
                <td className="px-4 py-3">{u.status === "SUSPENDED" ? <Badge tone="danger">Suspended</Badge> : u.role === "STUDENT" && !u.onboarded_at ? <Badge tone="warning">Invited</Badge> : <Badge tone="success">Active</Badge>}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.github_username ?? "—"}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
