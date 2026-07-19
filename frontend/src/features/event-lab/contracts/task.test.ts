import { describe, expect, it } from "vitest";
import {
  createTaskRequestSchema,
  taskSchema,
  updateTaskRequestSchema,
} from "@/features/event-lab/contracts/task";

describe("task contracts", () => {
  it("accepts the shared Spring Boot task representation", () => {
    expect(
      taskSchema.parse({
        id: 12,
        title: "Prepare synchronized demo",
        priority: "MEDIUM",
        status: "IN_REVIEW",
        createdAt: "2026-07-18T12:00:00Z",
        updatedAt: "2026-07-18T12:05:00Z",
      }),
    ).toMatchObject({ id: 12, priority: "MEDIUM", status: "IN_REVIEW" });
  });

  it("rejects unknown fields and empty updates", () => {
    expect(createTaskRequestSchema.parse({ title: "Foundation task" })).toEqual({
      title: "Foundation task",
    });
    expect(createTaskRequestSchema.safeParse({ title: "Task", priority: "URGENT" }).success).toBe(
      false,
    );
    expect(updateTaskRequestSchema.safeParse({}).success).toBe(false);
    expect(updateTaskRequestSchema.safeParse({ status: "ACTIVE", hidden: true }).success).toBe(
      false,
    );
  });
});
