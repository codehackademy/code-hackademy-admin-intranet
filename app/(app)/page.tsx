import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader } from "@/shared/src/ui";
import { formatInTimeZone } from "@/shared/src/time.ts";
import { requireProfile } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type { ProfileRow } from "@/shared/src/supabase/database.types.ts";

export const metadata = { title: "Dashboard" };

export default async function Home() {
  const me = await requireProfile();
  return me.role === "ADMIN" ? <AdminOverview me={me} /> : <ModeratorOverview me={me} />;
}

async function AdminOverview({ me }: { me: ProfileRow }) {
  const sb = await getSupabase();
  const count = async (table: string, col?: string, val?: string) => {
    let q = sb.from(table).select("*", { count: "exact", head: true });
    if (col && val) q = q.eq(col, val);
    return (await q).count ?? 0;
  };
  const [students, moderators, cohorts, courses, interest] = await Promise.all([
    count("profiles", "role", "STUDENT"), count("profiles", "role", "MODERATOR"), count("cohorts", "status", "ACTIVE"),
    count("courses", "status", "PUBLISHED"), count("interest_submissions", "status", "NEW"),
  ]);
  const { data: audit } = await sb.from("audit_logs").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(6);
  const tz = me.timezone ?? "UTC";
  const stats = [
    ["Students", students, "/users?role=STUDENT"], ["Moderators", moderators, "/users?role=MODERATOR"],
    ["Active cohorts", cohorts, "/cohorts"], ["Published courses", courses, "/courses"], ["New interest submissions", interest, "/interest"],
  ] as const;
  return (
    <>
      <PageHeader title="Dashboard" description="The state of the academy right now. Numbers come straight from the database." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, n, href]) => (
          <li key={label}><Link href={href} className="block h-full rounded-card border border-line bg-white p-5 shadow-card hover:border-ink"><p className="text-sm text-steel">{label}</p><p className="mt-1 font-display text-3xl font-black">{n}</p></Link></li>
        ))}
      </ul>
      <section className="mt-8" aria-labelledby="recent-h">
        <div className="mb-3 flex items-center justify-between"><h2 id="recent-h" className="font-display text-lg font-extrabold">Recent activity</h2><Link href="/audit-log" className="text-sm font-bold underline">View all</Link></div>
        {audit?.length ? (
          <Card className="divide-y divide-line p-0 sm:p-0">
            {audit.map((a) => (<div key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"><span><Badge>{a.action}</Badge> <span className="ml-2 font-mono">{a.entity_type}</span></span><time dateTime={a.created_at} className="text-steel">{formatInTimeZone(a.created_at, tz, { withDate: true })}</time></div>))}
          </Card>
        ) : <EmptyState title="No activity yet">Changes to cohorts, courses and people will be recorded here.</EmptyState>}
      </section>
    </>
  );
}

type Assignment = { cohort_course_id: string; cohort_courses: { cohorts: { name: string } | { name: string }[] | null; courses: { name: string } | { name: string }[] | null } | null };
const one = <T,>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

async function ModeratorOverview({ me }: { me: ProfileRow }) {
  const sb = await getSupabase();
  const { data } = await sb.from("moderator_assignments").select("cohort_course_id, cohort_courses(cohorts(name), courses(name))").eq("moderator_id", me.id);
  const rows = (data ?? []) as unknown as Assignment[];
  return (
    <>
      <PageHeader title="Overview" description="You only see the cohorts and courses you are assigned to." />
      {rows.length === 0 ? <EmptyState title="No assignments yet">An administrator assigns moderators to specific cohort courses. Once you are assigned, they appear here.</EmptyState> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (<li key={r.cohort_course_id}><Card><p className="text-sm text-steel">{one(r.cohort_courses?.cohorts)?.name}</p><p className="font-display text-xl font-extrabold">{one(r.cohort_courses?.courses)?.name}</p></Card></li>))}
        </ul>
      )}
      <p className="mt-6 max-w-2xl text-sm text-steel">Review queues, student rosters and grading tools arrive in a later release.</p>
    </>
  );
}
