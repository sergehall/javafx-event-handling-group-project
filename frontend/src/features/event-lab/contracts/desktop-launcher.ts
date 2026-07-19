import { z } from "zod";

export const desktopLauncherResponseSchema = z
  .object({
    status: z.enum(["started", "already-running"]),
    message: z.string().min(1),
  })
  .strict();

export const desktopLauncherErrorSchema = z.object({ message: z.string().min(1) }).strict();

export type DesktopLauncherResponse = z.infer<typeof desktopLauncherResponseSchema>;
