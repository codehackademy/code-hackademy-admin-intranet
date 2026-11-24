import { PageHeader } from "@/shared/src/ui";
import { ActionForm, FormInput, FormSelect, FormTextarea } from "@/shared/src/ui/action-form";
import { RUNTIME_STACKS } from "@/shared/src/constants.ts";
import { createCourse } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/guards";

export const metadata = { title: "New course" };

export default async function NewCourse() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New course" description="Courses start as drafts. Publishing arrives with the content release." />
      <div className="max-w-xl rounded-card border border-line bg-white p-6">
        <ActionForm action={createCourse} submitLabel="Create course">
          <FormInput name="name" label="Name" required />
          <FormInput name="slug" label="Slug" required hint="Lowercase letters, numbers and hyphens, e.g. backend-engineering." />
          <FormSelect name="runtimeStack" label="Runtime stack" required options={RUNTIME_STACKS.map((r) => ({ value: r, label: r }))} />
          <FormTextarea name="description" label="Description" />
        </ActionForm>
      </div>
    </>
  );
}
