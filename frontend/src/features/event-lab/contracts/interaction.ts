import { z } from "zod";

export const interactionTypeSchema = z.enum([
  "GREETING",
  "CANVAS_CLICK",
  "RESET",
]);

const greetingPayloadSchema = z
  .object({
    type: z.literal("GREETING"),
    message: z.string().trim().min(1).max(120),
  })
  .strict();

const canvasClickPayloadSchema = z
  .object({
    type: z.literal("CANVAS_CLICK"),
    xCoordinate: z.number().finite().nonnegative(),
    yCoordinate: z.number().finite().nonnegative(),
  })
  .strict();

const resetPayloadSchema = z
  .object({
    type: z.literal("RESET"),
  })
  .strict();

export const interactionPayloadSchema = z.discriminatedUnion("type", [
  greetingPayloadSchema,
  canvasClickPayloadSchema,
  resetPayloadSchema,
]);

export const interactionResponseSchema = z.object({
  id: z.number().int().positive(),
  type: interactionTypeSchema,
  message: z.string().nullable(),
  xCoordinate: z.number().finite().nonnegative().nullable(),
  yCoordinate: z.number().finite().nonnegative().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});

export const interactionListSchema = z.array(interactionResponseSchema);

export const apiMessageSchema = z.object({
  message: z.string().min(1),
});

export const apiHealthSchema = z.object({
  status: z.string().min(1),
});

export type InteractionPayload = z.infer<typeof interactionPayloadSchema>;
export type InteractionResponse = z.infer<typeof interactionResponseSchema>;
export type ApiHealth = z.infer<typeof apiHealthSchema>;
