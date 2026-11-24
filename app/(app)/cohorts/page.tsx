import Link from "next/link";
import { Badge, buttonVariants, EmptyState, PageHeader } from "@/shared/src/ui";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Cohorts" };

export default async function Cohorts() {
  await requireAdmin();
  const { data } = await (await getSupabase()).from("cohorts").select("id, name, start_date, end_date, status").order("start_date", { ascending: false });
  const add = <Link href="/cohorts/new" className={buttonVariants()}>New cohort</Link>;
  return (
    <>
      <PageHeader title="Cohorts" description="An intake of students. Add courses, enrol students and assign moderators." actions={add} />
      {!data?.length ? <EmptyState title="No cohorts yet" action={add}>Create your first cohort to start inviting students.</EmptyState> : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data.map((c) => (
            <li key={c.id}><Link href={`/cohorts/${c.id}`} className="block rounded-card border border-line bg-white p-5 shadow-card hover:border-ink">
              <div className="flex items-start justify-between gap-3"><p className="font-display text-xl font-extrabold">{c.name}</p><Badge tone={c.status === "ACTIVE" ? "success" : "neutral"}>{c.status}</Badge></div>
              <p className="mt-2 font-mono text-xs text-steel">Starts {c.start_date}{c.end_date ? ` · ends ${c.end_date}` : ""}</p>
            </Link></li>
          ))}
        </ul>
      )}
    </>
  );
}
