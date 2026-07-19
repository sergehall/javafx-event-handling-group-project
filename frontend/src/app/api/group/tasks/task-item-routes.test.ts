import { afterEach, describe, expect, it, vi } from "vitest";
import { DELETE as deleteTask, PATCH } from "@/app/api/group/tasks/[taskId]/route";
import { DELETE as clearCompleted } from "@/app/api/group/tasks/completed/route";

const updatedTask = {
  id: 9,
  title: "Prepare synchronized demo",
  priority: "HIGH",
  status: "IN_REVIEW",
  createdAt: "2026-07-18T12:00:00Z",
  updatedAt: "2026-07-18T12:05:00Z",
} as const;

function context(taskId: string) {
  return { params: Promise.resolve({ taskId }) };
}

describe("task item proxy routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates priority and status through the group API", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(updatedTask));
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/tasks/9", {
      method: "PATCH",
      body: JSON.stringify({ priority: "HIGH", status: "IN_REVIEW" }),
    });

    const response = await PATCH(request, context("9"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(updatedTask);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks/9"),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("removes one task and returns no content", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await deleteTask(
      new Request("http://localhost/api/group/tasks/9", { method: "DELETE" }),
      context("9"),
    );

    expect(response.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks/9"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("clears completed tasks through the dedicated endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ removedCount: 2 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await clearCompleted();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ removedCount: 2 });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks/completed"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("rejects an invalid id before forwarding the request", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/tasks/nope", {
      method: "PATCH",
      body: JSON.stringify({ status: "ACTIVE" }),
    });

    const response = await PATCH(request, context("nope"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
