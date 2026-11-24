import { redirect } from "next/navigation";
import { requireProfile } from "./auth";

/** Admin-only pages and actions. Moderators are sent to their overview. RLS remains the real enforcement. */
export async function requireAdmin() {
  const p = await requireProfile();
  if (p.role !== "ADMIN") redirect("/");
  return p;
}
