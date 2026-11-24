import { Card, EmptyState } from "@/shared/src/ui";
import { ActionForm, FormInput, FormSelect } from "@/shared/src/ui/action-form";
import { addCourseToCohort } from "@/lib/admin-actions";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Cohort" };
const one = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function CohortOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabase();
  const [{ data: cohort }, { data: ccs }, { data: courses }] = await Promise.all([
    sb.from("cohorts").select("*").eq("id", id).single(),
    sb.from("cohort_courses").select("id, course_start_date, courses(name, runtime_stack)").eq("cohort_id", id).order("course_start_date"),
    sb.from("courses").select("id, name").order("name"),
  ]);
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section aria-labelledby="c-h" className="space-y-4">
        <h2 id="c-h" className="font-display text-lg font-extrabold">Courses in this cohort</h2>
        {!ccs?.length ? <EmptyState title="No courses added yet">Add Backend, Frontend or both. Each course gets its own start date.</EmptyState> : (
          <ul className="space-y-3">
            {ccs.map((cc) => { const c = one(cc.courses as { name: string; runtime_stack: string } | { name: string; runtime_stack: string }[] | null); return (
              <li key={cc.id}><Card className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-display text-lg font-extrabold">{c?.name}</p><p className="font-mono text-xs text-steel">{c?.runtime_stack}</p></div><p className="text-sm"><span className="text-steel">Starts</span> <span className="font-bold">{cc.course_start_date}</span></p></Card></li>
            ); })}
          </ul>
        )}
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <Card className="p-4 sm:p-4"><dt className="text-steel">Unlock time (UTC)</dt><dd className="font-mono font-bold">{String(cohort?.unlock_time_utc).slice(0, 5)}</dd></Card>
          <Card className="p-4 sm:p-4"><dt className="text-steel">Phase 1</dt><dd className="font-bold">{cohort?.phase1_hours} hours</dd></Card>
          <Card className="p-4 sm:p-4"><dt className="text-steel">Phase 2</dt><dd className="font-bold">{cohort?.phase2_hours} hours</dd></Card>
        </dl>
        <p className="text-sm text-steel">Project scheduling, calendar review and publishing arrive in the content and calendar release.</p>
      </section>
      <section aria-labelledby="a-h">
        <h2 id="a-h" className="mb-4 font-display text-lg font-extrabold">Add a course</h2>
        <Card>
          {!courses?.length ? <p className="text-sm text-steel">Create a course first.</p> : (
            <ActionForm action={addCourseToCohort} submitLabel="Add course" pendingLabel="Adding…">
              <input type="hidden" name="cohortId" value={id} />
              <FormSelect name="courseId" label="Course" required options={courses.map((c) => ({ value: c.id, label: c.name }))} />
              <FormInput name="courseStartDate" label="Course start date" type="date" required defaultValue={cohort?.start_date} />
            </ActionForm>
          )}
        </Card>
      </section>
    </div>
  );
}
