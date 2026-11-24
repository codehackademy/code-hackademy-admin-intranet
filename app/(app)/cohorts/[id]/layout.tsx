import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/shared/src/ui";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export default async function CohortLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data: cohort } = await (await getSupabase()).from("cohorts").select("id, name, status").eq("id", id).maybeSingle();
  if (!cohort) notFound();
  const tab = "inline-flex min-h-11 items-center border-b-2 border-transparent px-1 text-sm font-bold hover:border-ink";
  return (
    <>
      <Link href="/cohorts" className="text-sm font-bold underline">All cohorts</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-black sm:text-3xl">{cohort.name}</h1><Badge tone={cohort.status === "ACTIVE" ? "success" : "neutral"}>{cohort.status}</Badge></div>
      <nav aria-label="Cohort sections" className="mb-6 mt-4 flex gap-6 border-b border-line">
        <Link href={`/cohorts/${id}`} className={tab}>Overview and courses</Link>
        <Link href={`/cohorts/${id}/people`} className={tab}>People</Link>
      </nav>
      {children}
    </>
  );
}
