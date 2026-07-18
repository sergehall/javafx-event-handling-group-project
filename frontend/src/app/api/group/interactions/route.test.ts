import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/group/interactions/route";

const savedCanvasClick = {
  id: 7,
  type: "CANVAS_CLICK",
  message: null,
  xCoordinate: 42.5,
  yCoordinate: 18,
  createdAt: "2026-07-18T12:00:00Z",
} as const;

describe("interaction proxy route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an invalid history limit before calling the group API", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost/api/group/interactions?limit=101"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates and forwards a canvas click", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(savedCanvasClick, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "CANVAS_CLICK",
        xCoordinate: 42.5,
        yCoordinate: 18,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(savedCanvasClick);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://127.0.0.1:8081/api/v1/interactions"),
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      }),
    );
  });

  it("rejects an oversized body without calling the group API", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/group/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "GREETING", message: "x".repeat(2_100) }),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a stable error when the group API is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("connection refused")),
    );
    const request = new Request("http://localhost/api/group/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "RESET" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "The group API is unavailable.",
    });
  });
});
