import { describe, expect, it } from "vitest";
import { interestSchema, onboardingSchema, inviteUserSchema, cohortSchema, githubUsernameSchema, setPasswordSchema } from "../src/index.ts";

const validInterest = {
  fullName: "Ada Obi", email: "ada@example.com", country: "Nigeria", city: "Lagos",
  programme: "BACKEND_ENGINEERING", experience: "BEGINNER",
  reason: "I want to build real software and join a serious community.",
  availability: "H10_20", consent: true,
} as const;

describe("interestSchema", () => {
  it("accepts a valid submission and drops empty optional fields", () => {
    const r = interestSchema.parse({ ...validInterest, phone: "", portfolioUrl: "" });
    expect(r.phone).toBeUndefined();
    expect(r.portfolioUrl).toBeUndefined();
  });
  it("requires consent", () => {
    expect(interestSchema.safeParse({ ...validInterest, consent: false }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(interestSchema.safeParse({ ...validInterest, website: "http://spam" }).success).toBe(false);
  });
  it("rejects a non-link portfolio value", () => {
    expect(interestSchema.safeParse({ ...validInterest, portfolioUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  const ok = { country: "Nigeria", city: "Lagos", timezone: "Africa/Lagos", githubUsername: "ada-obi", consent: true };
  it("accepts valid input", () => expect(onboardingSchema.safeParse(ok).success).toBe(true));
  it("rejects invalid time zones", () => expect(onboardingSchema.safeParse({ ...ok, timezone: "Mars/Base" }).success).toBe(false));
  it("rejects missing consent", () => expect(onboardingSchema.safeParse({ ...ok, consent: false }).success).toBe(false));
});

describe("githubUsernameSchema", () => {
  it.each(["octocat", "a-b", "A1"])("accepts %s", (u) => expect(githubUsernameSchema.safeParse(u).success).toBe(true));
  it.each(["-bad", "bad-", "bad--name", "has space", "@octocat", ""])("rejects %s", (u) => expect(githubUsernameSchema.safeParse(u).success).toBe(false));
});

describe("inviteUserSchema", () => {
  const id = "3f2b8c1e-8f6a-4c1a-9a53-0a6c3b0b2f11";
  it("requires cohort and course for students", () => {
    expect(inviteUserSchema.safeParse({ role: "STUDENT", name: "Ada", email: "a@b.co" }).success).toBe(false);
    expect(inviteUserSchema.safeParse({ role: "STUDENT", name: "Ada", email: "a@b.co", cohortId: id, courseId: id }).success).toBe(true);
  });
  it("never allows inviting an admin", () => {
    expect(inviteUserSchema.safeParse({ role: "ADMIN", name: "Eve", email: "e@b.co" }).success).toBe(false);
  });
  it("allows a moderator without a cohort", () => {
    expect(inviteUserSchema.safeParse({ role: "MODERATOR", name: "Mo", email: "m@b.co" }).success).toBe(true);
  });
});

describe("cohortSchema / passwords", () => {
  it("rejects an end date before the start date", () => {
    expect(cohortSchema.safeParse({ name: "Cohort 1", startDate: "2026-12-07", endDate: "2026-12-01" }).success).toBe(false);
  });
  it("treats a blank end date as unset", () => {
    expect(cohortSchema.parse({ name: "Cohort 1", startDate: "2026-12-07", endDate: "" }).endDate).toBeUndefined();
  });
  it("requires matching strong passwords", () => {
    expect(setPasswordSchema.safeParse({ password: "short1", confirm: "short1" }).success).toBe(false);
    expect(setPasswordSchema.safeParse({ password: "longenough123", confirm: "different123" }).success).toBe(false);
    expect(setPasswordSchema.safeParse({ password: "longenough123", confirm: "longenough123" }).success).toBe(true);
  });
});
