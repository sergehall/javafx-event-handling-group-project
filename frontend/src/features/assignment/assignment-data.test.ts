import { describe, expect, it } from "vitest";
import {
  ASSIGNMENT_REQUIREMENTS,
  RUBRIC_ITEMS,
  RUBRIC_TOTAL,
} from "@/features/assignment/assignment-data";

describe("assignment data", () => {
  it("captures all seven written requirements", () => {
    expect(ASSIGNMENT_REQUIREMENTS).toHaveLength(7);
  });

  it("matches the twenty-point rubric shown in the assignment", () => {
    expect(RUBRIC_ITEMS).toHaveLength(12);
    expect(RUBRIC_TOTAL).toBe(20);
  });
});
