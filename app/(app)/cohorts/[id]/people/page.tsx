import { Badge, Card, EmptyState } from "@/shared/src/ui";
import { ActionForm, FormSelect } from "@/shared/src/ui/action-form";
import { assignModerator, removeAssignment } from "@/lib/admin-actions";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Cohort people" };
type Named = { name: string } | { name: string }[] | null;
const one = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function People({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabase();
  const [{ data: ccs }, { data: members }, { data: enr }, { data: assigns }, { data: mods }] = await Promise.all([
    sb.from("cohort_courses").select("id, courses(name)").eq("cohort_id", id),
    sb.from("cohort_members").select("user_id, member_role, profiles(name, email)").eq("cohort_id", id).eq("member_role", "STUDENT"),
    sb.from("enrollments").select("student_id, cohort_course_id, status"),
    sb.from("moderator_assignments").select("moderator_id, cohort_course_id, profiles(name)"),
    sb.from("profiles").select("id, name").eq("role", "MODERATOR").order("name"),
  ]);
  const ccName = new Map((ccs ?? []).map((c) => [c.id, one(c.courses as Named)?.name ?? "Course"]));
  const ccIds = new Set(ccName.keys());
  const myAssigns = (assigns ?? []).filter((a) => ccIds.has(a.cohort_course_id));
  const options = (ccs ?? []).map((c) => ({ value: c.id, label: ccName.get(c.id)! }));
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section aria-labelledby="s-h">
        <h2 id="s-h" className="mb-4 font-display text-lg font-extrabold">Students ({members?.length ?? 0})</h2>
        {!members?.length ? <EmptyState title="No students yet">Invite students from Users, choosing this cohort and course.</EmptyState> : (
          <div className="overflow-x-auto rounded-card border border-line bg-white">
            <table className="w-full min-w-[28rem] text-left text-sm"><thead className="border-b border-line bg-paper text-steel"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Courses</th></tr></thead>
              <tbody className="divide-y divide-line">
                {members.map((m) => { const p = one(m.profiles as { name: string; email: string } | { name: string; email: string }[] | null); return (
                  <tr key={m.user_id}><td className="px-4 py-3"><p className="font-bold">{p?.name}</p><p className="text-xs text-steel">{p?.email}</p></td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{(enr ?? []).filter((e) => e.student_id === m.user_id && ccIds.has(e.cohort_course_id)).map((e) => <Badge key={e.cohort_course_id} tone={e.status === "ACTIVE" ? "brand" : "neutral"}>{ccName.get(e.cohort_course_id)}</Badge>)}</div></td></tr>
                ); })}
              </tbody></table>
          </div>
        )}
      </section>
      <section aria-labelledby="m-h" className="space-y-4">
        <h2 id="m-h" className="font-display text-lg font-extrabold">Moderators</h2>
        {myAssigns.length ? (
          <ul className="space-y-2">{myAssigns.map((a) => (
            <li key={a.moderator_id + a.cohort_course_id}><Card className="flex items-center justify-between gap-3 p-4 sm:p-4"><div><p className="font-bold">{one(a.profiles as Named)?.name}</p><p className="text-xs text-steel">{ccName.get(a.cohort_course_id)}</p></div>
              <form action={removeAssignment}><input type="hidden" name="moderatorId" value={a.moderator_id} /><input type="hidden" name="cohortCourseId" value={a.cohort_course_id} /><input type="hidden" name="cohortId" value={id} />
                <button type="submit" className="min-h-11 rounded-ui px-3 text-sm font-bold text-danger underline">Remove</button></form></Card></li>))}</ul>
        ) : <p className="text-sm text-steel">No moderators assigned to this cohort yet.</p>}
        <Card>
          {!options.length ? <p className="text-sm text-steel">Add a course to the cohort first.</p> : !mods?.length ? <p className="text-sm text-steel">Invite a moderator from Users first.</p> : (
            <ActionForm action={assignModerator} submitLabel="Assign moderator" pendingLabel="Assigning…">
              <input type="hidden" name="cohortId" value={id} />
              <FormSelect name="moderatorId" label="Moderator" required options={(mods ?? []).map((m) => ({ value: m.id, label: m.name }))} />
              <FormSelect name="cohortCourseId" label="Course in this cohort" required options={options} />
            </ActionForm>
          )}
        </Card>
      </section>
    </div>
  );
}
