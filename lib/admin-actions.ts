"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addCourseToCohortSchema, cohortSchema, courseSchema, inviteUserSchema } from "@/shared/src/schemas/admin.ts";
import type { FormState } from "@/shared/src/ui/action-form";
import { requireAdmin } from "./guards";
import { getSupabase } from "./supabase";

const errs = (e: { flatten(): { fieldErrors: unknown } }) => e.flatten().fieldErrors as Record<string, string[]>;
const DENIED: FormState = { message: "You don't have permission to do that." };
const FAILED: FormState = { message: "That couldn't be saved. Nothing was changed. Please try again." };
const clean = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([k]) => !k.startsWith("$ACTION")));

export async function createCourse(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(clean(fd));
  if (!parsed.success) return { message: "Check the highlighted fields.", fieldErrors: errs(parsed.error) };
  const { name, slug, description, runtimeStack } = parsed.data;
  const { error } = await (await getSupabase()).from("courses").insert({ name, slug, description, runtime_stack: runtimeStack });
  if (error?.code === "23505") return { message: "Check the highlighted fields.", fieldErrors: { slug: ["That slug is already used by another course."] } };
  if (error?.code === "42501") return DENIED;
  if (error) return FAILED;
  revalidatePath("/courses");
  redirect("/courses");
}

export async function createCohort(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = cohortSchema.safeParse(clean(fd));
  if (!parsed.success) return { message: "Check the highlighted fields.", fieldErrors: errs(parsed.error) };
  const { name, startDate, endDate } = parsed.data;
  const { data, error } = await (await getSupabase()).from("cohorts").insert({ name, start_date: startDate, end_date: endDate ?? null }).select("id").single();
  if (error?.code === "42501") return DENIED;
  if (error || !data) return FAILED;
  revalidatePath("/cohorts");
  redirect(`/cohorts/${data.id}`);
}

export async function addCourseToCohort(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = addCourseToCohortSchema.safeParse(clean(fd));
  if (!parsed.success) return { message: "Check the highlighted fields.", fieldErrors: errs(parsed.error) };
  const { cohortId, courseId, courseStartDate } = parsed.data;
  const { error } = await (await getSupabase()).from("cohort_courses").insert({ cohort_id: cohortId, course_id: courseId, course_start_date: courseStartDate });
  if (error?.code === "23505") return { message: "That course is already part of this cohort." };
  if (error?.code === "42501") return DENIED;
  if (error) return FAILED;
  revalidatePath(`/cohorts/${cohortId}`);
  return { ok: true, message: "Course added to the cohort." };
}

export async function assignModerator(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const moderatorId = String(fd.get("moderatorId") ?? "");
  const cohortCourseId = String(fd.get("cohortCourseId") ?? "");
  const cohortId = String(fd.get("cohortId") ?? "");
  if (!moderatorId || !cohortCourseId) return { message: "Choose a moderator and a course.", fieldErrors: { moderatorId: moderatorId ? [] : ["Choose a moderator."], cohortCourseId: cohortCourseId ? [] : ["Choose a course."] } };
  const { error } = await (await getSupabase()).from("moderator_assignments").insert({ moderator_id: moderatorId, cohort_course_id: cohortCourseId });
  if (error?.code === "23505") return { message: "That moderator is already assigned to this course." };
  if (error?.code === "42501") return DENIED;
  if (error) return FAILED;
  revalidatePath(`/cohorts/${cohortId}/people`);
  return { ok: true, message: "Moderator assigned." };
}

export async function removeAssignment(fd: FormData): Promise<void> {
  await requireAdmin();
  const moderatorId = String(fd.get("moderatorId"));
  const cohortCourseId = String(fd.get("cohortCourseId"));
  const cohortId = String(fd.get("cohortId"));
  await (await getSupabase()).from("moderator_assignments").delete().eq("moderator_id", moderatorId).eq("cohort_course_id", cohortCourseId);
  revalidatePath(`/cohorts/${cohortId}/people`);
}

type FnErr = { error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } } };

export async function inviteUser(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const [cohortId, courseId] = String(fd.get("cohortCourse") ?? "").split("|");
  const parsed = inviteUserSchema.safeParse({ role: fd.get("role"), name: fd.get("name"), email: fd.get("email"), cohortId: cohortId || undefined, courseId: courseId || undefined });
  if (!parsed.success) {
    const fe = errs(parsed.error);
    if (fe.cohortId) fe.cohortCourse = fe.cohortId;
    return { message: "Check the highlighted fields.", fieldErrors: fe };
  }
  // The Edge Function re-checks that the caller is an admin, creates the auth user, profile, enrolment and audit entry.
  const { error } = await (await getSupabase()).functions.invoke("invite-user", { body: parsed.data });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const body = ctx && typeof ctx.json === "function" ? ((await ctx.json().catch(() => null)) as FnErr | null) : null;
    return { message: body?.error?.message ?? "The invitation couldn't be sent. Nothing was saved.", fieldErrors: body?.error?.details?.fieldErrors };
  }
  revalidatePath("/users");
  return { ok: true, message: `Invitation sent to ${parsed.data.email}. They'll set a password from the email link.` };
}
