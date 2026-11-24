/**
 * Hand-written row types for the Phase 0 tables, mirroring
 * codehackademy-backend/supabase/migrations. Regenerate with `supabase gen types`
 * once a Supabase project is linked, and replace this file.
 */
import type { CohortStatus, CourseStatus, EnrollmentStatus, MemberRole, Role, RuntimeStack, UserStatus } from "../constants.ts";

export type ProfileRow = {
  id: string;
  role: Role;
  name: string;
  email: string;
  github_username: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  status: UserStatus;
  suspension_reason: string | null;
  consented_at: string | null;
  onboarded_at: string | null;
  created_at: string;
};

export type CourseRow = {
  id: string; name: string; slug: string; description: string;
  runtime_stack: RuntimeStack; status: CourseStatus; created_at: string;
};

export type CohortRow = {
  id: string; name: string; start_date: string; end_date: string | null;
  unlock_time_utc: string; phase1_hours: number; phase2_hours: number;
  cloned_from_cohort_id: string | null; status: CohortStatus; created_at: string;
};

export type CohortCourseRow = { id: string; cohort_id: string; course_id: string; course_start_date: string };
export type CohortMemberRow = { cohort_id: string; user_id: string; member_role: MemberRole; joined_at: string };
export type EnrollmentRow = { student_id: string; cohort_course_id: string; status: EnrollmentStatus };
export type ModeratorAssignmentRow = { moderator_id: string; cohort_course_id: string };

export type AuditLogRow = {
  id: number; actor_id: string | null; action: string; entity_type: string; entity_id: string | null;
  before_json: unknown; after_json: unknown; created_at: string;
};
