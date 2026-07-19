import type { z } from "zod";
import {
  clearCompletedResponseSchema,
  createTaskRequestSchema,
  taskApiMessageSchema,
  taskListSchema,
  taskSchema,
  updateTaskRequestSchema,
  type ClearCompletedResponse,
  type CreateTaskRequest,
  type Task,
  type UpdateTaskRequest,
} from "@/features/event-lab/contracts/task";

const TASK_REQUEST_TIMEOUT_MS = 5_000;

export class TaskClientError extends Error {
  readonly unavailable: boolean;

  constructor(message: string, unavailable: boolean, options?: ErrorOptions) {
    super(message, options);
    this.name = "TaskClientError";
    this.unavailable = unavailable;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (cause) {
    throw new TaskClientError("The task service returned an unreadable response.", true, {
      cause,
    });
  }
}

async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(TASK_REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new TaskClientError("Cannot reach the shared task database.", true, { cause });
  }

  const body = await readJson(response);
  if (!response.ok) {
    const parsedMessage = taskApiMessageSchema.safeParse(body);
    const message = parsedMessage.success
      ? parsedMessage.data.message
      : "The task request was not successful.";
    throw new TaskClientError(message, response.status >= 500);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new TaskClientError("The task service returned invalid data.", true, {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

export function listTasks(): Promise<Task[]> {
  return requestJson("/api/group/tasks", taskListSchema);
}

export function createTask(request: CreateTaskRequest): Promise<Task> {
  const payload = createTaskRequestSchema.parse(request);
  return requestJson("/api/group/tasks", taskSchema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateTask(taskId: number, request: UpdateTaskRequest): Promise<Task> {
  const payload = updateTaskRequestSchema.parse(request);
  return requestJson(`/api/group/tasks/${taskId}`, taskSchema, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function removeTask(taskId: number): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/group/tasks/${taskId}`, {
      method: "DELETE",
      cache: "no-store",
      signal: AbortSignal.timeout(TASK_REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new TaskClientError("Cannot reach the shared task database.", true, { cause });
  }

  if (response.status === 204) {
    return;
  }

  if (response.ok) {
    throw new TaskClientError("The task service returned an invalid delete response.", true);
  }

  const body = await readJson(response);
  const parsedMessage = taskApiMessageSchema.safeParse(body);
  throw new TaskClientError(
    parsedMessage.success ? parsedMessage.data.message : "The task could not be removed.",
    response.status >= 500,
  );
}

export function clearCompletedTasks(): Promise<ClearCompletedResponse> {
  return requestJson("/api/group/tasks/completed", clearCompletedResponseSchema, {
    method: "DELETE",
  });
}
