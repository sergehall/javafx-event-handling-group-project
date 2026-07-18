import { describe, expect, it } from "vitest";
import {
  interactionPayloadSchema,
  interactionResponseSchema,
} from "@/features/event-lab/contracts/interaction";

describe("interaction contracts", () => {
  it("accepts a valid canvas click payload", () => {
    expect(
      interactionPayloadSchema.parse({
        type: "CANVAS_CLICK",
        xCoordinate: 42.5,
        yCoordinate: 18,
      }),
    ).toEqual({
      type: "CANVAS_CLICK",
      xCoordinate: 42.5,
      yCoordinate: 18,
    });
  });

  it("rejects fields that do not belong to the interaction type", () => {
    expect(() =>
      interactionPayloadSchema.parse({
        type: "RESET",
        message: "unexpected",
      }),
    ).toThrow();
  });

  it("rejects an invalid response from the upstream API", () => {
    expect(() =>
      interactionResponseSchema.parse({
        id: 1,
        type: "CANVAS_CLICK",
        message: null,
        xCoordinate: -1,
        yCoordinate: 20,
        createdAt: "2026-07-18T12:00:00Z",
      }),
    ).toThrow();
  });
});
