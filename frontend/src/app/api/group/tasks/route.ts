import {
  parseTaskRequest,
  proxyTaskJson,
  taskErrorResponse,
} from "@/features/event-lab/api/task-route-support";
import {
  createTaskRequestSchema,
  taskListSchema,
  taskSchema,
} from "@/features/event-lab/contracts/task";
import { fetchGroupApi } from "@/lib/group-api/server-client";

export async function GET() {
  try {
    const response = await fetchGroupApi("/api/v1/tasks");
    return await proxyTaskJson(response, taskListSchema);
  } catch {
    return taskErrorResponse("Task storage is unavailable.", 502);
  }
}

export async function POST(request: Request) {
  const payload = await parseTaskRequest(
    request,
    createTaskRequestSchema,
    "The task payload is invalid.",
  );
  if (!payload.ok) {
    return payload.response;
  }

  try {
    const response = await fetchGroupApi("/api/v1/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data),
    });
    return await proxyTaskJson(response, taskSchema, 201);
  } catch {
    return taskErrorResponse("Task storage is unavailable.", 502);
  }
}
