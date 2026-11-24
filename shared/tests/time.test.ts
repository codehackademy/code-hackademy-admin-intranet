import { describe, expect, it } from "vitest";
import { formatInTimeZone, isValidTimeZone, utcInstant, DEFAULTS } from "../src/index.ts";

describe("time zones (spec vector 24)", () => {
  const unlock = utcInstant("2026-11-23", DEFAULTS.unlockTimeUtc); // 05:00 UTC
  it("shows 06:00 in Lagos and 08:00 in Nairobi", () => {
    expect(formatInTimeZone(unlock, "Africa/Lagos")).toBe("06:00");
    expect(formatInTimeZone(unlock, "Africa/Nairobi")).toBe("08:00");
  });
  it("validates IANA names", () => {
    expect(isValidTimeZone("Africa/Lagos")).toBe(true);
    expect(isValidTimeZone("Nowhere/City")).toBe(false);
  });
  it("includes the date when asked", () => {
    expect(formatInTimeZone(unlock, "Africa/Lagos", { withDate: true })).toContain("Mon");
  });
});
