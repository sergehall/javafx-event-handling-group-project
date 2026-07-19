import { proxyTaskJson, taskErrorResponse } from "@/features/event-lab/api/task-route-support";
import { clearCompletedResponseSchema } from "@/features/event-lab/contracts/task";
import { fetchGroupApi } from "@/lib/group-api/server-client";

export async function DELETE() {
  try {
    const response = await fetchGroupApi("/api/v1/tasks/completed", { method: "DELETE" });
    return await proxyTaskJson(response, clearCompletedResponseSchema);
  } catch {
    return taskErrorResponse("Task storage is unavailable.", 502);
  }
}
