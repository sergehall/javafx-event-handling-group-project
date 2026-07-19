import { z } from "zod";
import {
  parseTaskRequest,
  proxyTaskJson,
  taskErrorResponse,
} from "@/features/event-lab/api/task-route-support";
import { taskSchema, updateTaskRequestSchema } from "@/features/event-lab/contracts/task";
import { fetchGroupApi } from "@/lib/group-api/server-client";

const taskIdSchema = z.coerce.number().int().positive();
type RouteContext = Readonly<{ params: Promise<{ taskId: string }> }>;

async function getTaskId(context: RouteContext): Promise<number | null> {
  const parsed = taskIdSchema.safeParse((await context.params).taskId);
  return parsed.success ? parsed.data : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const taskId = await getTaskId(context);
  if (taskId === null) {
    return taskErrorResponse("Task id must be a positive integer.", 400);
  }

  const payload = await parseTaskRequest(
    request,
    updateTaskRequestSchema,
    "The task update is invalid.",
  );
  if (!payload.ok) {
    return payload.response;
  }

  try {
    const response = await fetchGroupApi(`/api/v1/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data),
    });
    return await proxyTaskJson(response, taskSchema);
  } catch {
    return taskErrorResponse("Task storage is unavailable.", 502);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const taskId = await getTaskId(context);
  if (taskId === null) {
    return taskErrorResponse("Task id must be a positive integer.", 400);
  }

  try {
    const response = await fetchGroupApi(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }
    if (response.ok) {
      return taskErrorResponse("The group API returned an invalid delete response.", 502);
    }
    return await proxyTaskJson(response, taskSchema);
  } catch {
    return taskErrorResponse("Task storage is unavailable.", 502);
  }
}
