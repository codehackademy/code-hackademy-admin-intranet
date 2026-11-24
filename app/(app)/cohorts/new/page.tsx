import { PageHeader } from "@/shared/src/ui";
import { ActionForm, FormInput } from "@/shared/src/ui/action-form";
import { createCohort } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/guards";

export const metadata = { title: "New cohort" };

export default async function NewCohort() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New cohort" description="Defaults: unlock at 05:00 UTC (06:00 in Lagos), Phase 1 of 24 hours, Phase 2 of 48 hours. The cohort is saved as a draft." />
      <div className="max-w-xl rounded-card border border-line bg-white p-6">
        <ActionForm action={createCohort} submitLabel="Create cohort">
          <FormInput name="name" label="Name" required />
          <FormInput name="startDate" label="Start date" type="date" required />
          <FormInput name="endDate" label="End date" type="date" />
        </ActionForm>
      </div>
    </>
  );
}
