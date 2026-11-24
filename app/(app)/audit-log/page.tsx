import { Badge, EmptyState, PageHeader } from "@/shared/src/ui";
import { formatInTimeZone } from "@/shared/src/time.ts";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Audit log" };

export default async function AuditLog() {
  const me = await requireAdmin();
  const sb = await getSupabase();
  const { data } = await sb.from("audit_logs").select("id, actor_id, action, entity_type, entity_id, created_at").order("created_at", { ascending: false }).limit(100);
  const ids = [...new Set((data ?? []).map((a) => a.actor_id).filter(Boolean))] as string[];
  const { data: actors } = ids.length ? await sb.from("profiles").select("id, name").in("id", ids) : { data: [] };
  const name = new Map((actors ?? []).map((a) => [a.id, a.name]));
  return (
    <>
      <PageHeader title="Audit log" description="Append-only. Nobody, including administrators, can edit or delete these entries. Showing the latest 100." />
      {!data?.length ? <EmptyState title="Nothing recorded yet">Changes to cohorts, courses, people and settings are recorded here automatically.</EmptyState> : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-paper text-steel"><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th></tr></thead>
            <tbody className="divide-y divide-line">{data.map((a) => (
              <tr key={a.id}><td className="whitespace-nowrap px-4 py-3 text-xs"><time dateTime={a.created_at}>{formatInTimeZone(a.created_at, me.timezone ?? "UTC", { withDate: true })}</time></td>
                <td className="px-4 py-3">{a.actor_id ? name.get(a.actor_id) ?? "Unknown" : <span className="text-steel">System</span>}</td><td className="px-4 py-3"><Badge>{a.action}</Badge></td>
                <td className="px-4 py-3 font-mono text-xs">{a.entity_type}<span className="text-steel"> · {a.entity_id}</span></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
