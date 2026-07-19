import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/group/tasks/route";

const task = {
  id: 9,
  title: "Prepare synchronized demo",
  priority: "MEDIUM",
  status: "ACTIVE",
  createdAt: "2026-07-18T12:00:00Z",
  updatedAt: "2026-07-18T12:00:00Z",
} as const;

describe("task collection proxy route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads tasks from the group API", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json([task]));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([task]);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("validates and forwards a new task", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(task, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title, priority: task.priority }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(task);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: task.title, priority: task.priority }),
      }),
    );
  });

  it("lets group-api choose the default priority for a Foundation task", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(task, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task.title }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/tasks"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: task.title }),
      }),
    );
  });

  it("rejects an invalid task before calling the group API", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "", priority: "URGENT" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves a safe duplicate-task conflict from the group API", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ detail: "A task with this title already exists." }, { status: 409 }),
        ),
    );
    const request = new Request("http://localhost/api/group/tasks", {
      method: "POST",
      body: JSON.stringify({ title: task.title, priority: task.priority }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      message: "A task with this title already exists.",
    });
  });
});
