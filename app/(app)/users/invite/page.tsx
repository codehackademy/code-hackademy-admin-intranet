import { PageHeader } from "@/shared/src/ui";
import { ActionForm, FormInput, FormSelect } from "@/shared/src/ui/action-form";
import { inviteUser } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/guards";
import { getSupabase } from "@/lib/supabase";

export const metadata = { title: "Invite user" };
type N = { name: string } | { name: string }[] | null;
const one = (v: N) => (Array.isArray(v) ? v[0] : v)?.name ?? "";

export default async function Invite() {
  await requireAdmin();
  const { data } = await (await getSupabase()).from("cohort_courses").select("cohort_id, course_id, cohorts(name), courses(name)");
  const options = (data ?? []).map((r) => ({ value: `${r.cohort_id}|${r.course_id}`, label: `${one(r.cohorts as N)} — ${one(r.courses as N)}` }));
  return (
    <>
      <PageHeader title="Invite a user" description="They receive an email link to set their own password. Students finish onboarding on first sign-in." />
      <div className="max-w-xl rounded-card border border-line bg-white p-6">
        <ActionForm action={inviteUser} submitLabel="Send invitation" pendingLabel="Sending…">
          <FormSelect name="role" label="Role" required options={[{ value: "STUDENT", label: "Student" }, { value: "MODERATOR", label: "Moderator" }]} />
          <FormInput name="name" label="Full name" required autoComplete="off" />
          <FormInput name="email" label="Email" type="email" required autoComplete="off" />
          <FormSelect name="cohortCourse" label="Cohort and course" hint="Required for students. Add courses to a cohort first." options={options} placeholder="Not applicable" />
        </ActionForm>
      </div>
    </>
  );
}
