import { Badge, EmptyState, PageHeader } from "@/shared/src/ui";
import { formatInTimeZone } from "@/shared/src/time.ts";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Interest" };

export default async function Interest() {
  const me = await requireAdmin();
  const { data } = await (await getSupabase()).from("interest_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHeader title="Interest submissions" description="People who used the public interest form. These are not accounts and none of them are enrolled." />
      {!data?.length ? <EmptyState title="No submissions yet">New submissions from the public website appear here.</EmptyState> : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-line bg-paper text-steel"><tr><th className="px-4 py-3">Person</th><th className="px-4 py-3">Programme</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">Why</th><th className="px-4 py-3">Received</th></tr></thead>
            <tbody className="divide-y divide-line align-top">{data.map((s) => (
              <tr key={s.id}><td className="px-4 py-3"><p className="font-bold">{s.full_name}</p><a href={`mailto:${s.email}`} className="text-xs underline">{s.email}</a><p className="text-xs text-steel">{s.city}, {s.country}</p></td>
                <td className="px-4 py-3"><Badge tone="brand">{s.programme}</Badge></td><td className="px-4 py-3 text-xs">{s.experience}<br />{s.availability}</td>
                <td className="max-w-sm px-4 py-3 text-steel">{s.reason}</td><td className="px-4 py-3 text-xs"><time dateTime={s.created_at}>{formatInTimeZone(s.created_at, me.timezone ?? "UTC", { withDate: true })}</time></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
