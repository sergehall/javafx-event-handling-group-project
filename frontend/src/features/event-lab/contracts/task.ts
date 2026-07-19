import { z } from "zod";

export const MAX_TASK_LENGTH = 80;

export const taskPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const taskStatusSchema = z.enum(["ACTIVE", "IN_REVIEW", "COMPLETED"]);

export const taskSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string().trim().min(1).max(MAX_TASK_LENGTH),
    priority: taskPrioritySchema,
    status: taskStatusSchema,
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const taskListSchema = z.array(taskSchema);

export const createTaskRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(MAX_TASK_LENGTH),
    priority: taskPrioritySchema.optional(),
  })
  .strict();

export const updateTaskRequestSchema = z
  .object({
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .strict()
  .refine((request) => request.priority !== undefined || request.status !== undefined, {
    message: "Choose a priority or status to update.",
  });

export const clearCompletedResponseSchema = z
  .object({
    removedCount: z.number().int().nonnegative(),
  })
  .strict();

export const taskApiMessageSchema = z.object({ message: z.string().min(1) }).strict();

export const taskProblemSchema = z.object({ detail: z.string().min(1) }).passthrough();

export type Task = z.infer<typeof taskSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>;
export type ClearCompletedResponse = z.infer<typeof clearCompletedResponseSchema>;
