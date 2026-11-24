import Link from "next/link";
import { Badge, buttonVariants, EmptyState, PageHeader } from "@/shared/src/ui";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Courses" };

export default async function Courses() {
  await requireAdmin();
  const { data } = await (await getSupabase()).from("courses").select("id, name, slug, runtime_stack, status").order("created_at", { ascending: false });
  const add = <Link href="/courses/new" className={buttonVariants()}>New course</Link>;
  return (
    <>
      <PageHeader title="Courses" description="Courses hold the curriculum and exist independently from cohorts." actions={add} />
      {!data?.length ? <EmptyState title="No courses yet" action={add}>Create Backend Engineering and Frontend Engineering to get started.</EmptyState> : (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-line bg-paper text-steel"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Runtime</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.map((c) => (<tr key={c.id}><td className="px-4 py-3"><p className="font-bold">{c.name}</p><p className="font-mono text-xs text-steel">{c.slug}</p></td><td className="px-4 py-3 font-mono text-xs">{c.runtime_stack}</td><td className="px-4 py-3"><Badge tone={c.status === "PUBLISHED" ? "success" : "neutral"}>{c.status}</Badge></td></tr>))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-sm text-steel">Curriculum, projects and tasks are added in the content release.</p>
    </>
  );
}
