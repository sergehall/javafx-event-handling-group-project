import { beforeEach, describe, expect, it, vi } from "vitest";

const { accessSyncMock, execFileMock, existsSyncMock, spawnMock } = vi.hoisted(() => ({
  accessSyncMock: vi.fn(),
  execFileMock: vi.fn(),
  existsSyncMock: vi.fn(() => true),
  spawnMock: vi.fn(),
}));

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    default: { ...actual, execFile: execFileMock, spawn: spawnMock },
    execFile: execFileMock,
    spawn: spawnMock,
  };
});
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    accessSync: accessSyncMock,
    default: { ...actual, accessSync: accessSyncMock, existsSync: existsSyncMock },
    existsSync: existsSyncMock,
  };
});

import { POST } from "@/app/api/local/desktop/start/route";

function launchRequest(headers: HeadersInit = {}) {
  return new Request("http://127.0.0.1:3000/api/local/desktop/start", {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:3000",
      "X-JavaFX-Launcher": "web-lab",
      ...headers,
    },
  });
}

describe("local desktop launcher route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execFileMock.mockImplementation((...arguments_: unknown[]) => {
      const callback = arguments_.at(-1) as (
        error: Error | null,
        stdout: string,
        stderr: string,
      ) => void;
      callback(null, "", "");
    });
  });

  it("rejects requests without the launcher header", async () => {
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/local/desktop/start", {
        method: "POST",
        headers: { Origin: "http://127.0.0.1:3000" },
      }),
    );

    expect(response.status).toBe(403);
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request", async () => {
    const response = await POST(launchRequest({ Origin: "https://example.com" }));

    expect(response.status).toBe(403);
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("rejects a browser request marked as cross-site", async () => {
    const response = await POST(
      launchRequest({
        Origin: "http://localhost:3000",
        "Sec-Fetch-Site": "cross-site",
      }),
    );

    expect(response.status).toBe(403);
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("does not duplicate a JavaFX process started from the terminal", async () => {
    execFileMock.mockImplementation((...arguments_: unknown[]) => {
      const callback = arguments_.at(-1) as (
        error: Error | null,
        stdout: string,
        stderr: string,
      ) => void;
      callback(
        null,
        "java org.apache.maven.wrapper.MavenWrapperMain -pl desktop-app javafx:run",
        "",
      );
    });

    const response = await POST(launchRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "already-running",
      message: "JavaFX is already running.",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("starts only the fixed JavaFX Maven command", async () => {
    const fakeChild = {
      exitCode: null,
      signalCode: null,
      killed: false,
      once: vi.fn(),
      unref: vi.fn(),
    };
    spawnMock.mockReturnValue(fakeChild);

    const response = await POST(launchRequest());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      status: "started",
      message: "JavaFX is starting.",
    });
    expect(spawnMock).toHaveBeenCalledWith(
      expect.stringMatching(/mvnw$/),
      ["-pl", "desktop-app", "javafx:run"],
      expect.objectContaining({
        detached: true,
        shell: false,
        stdio: "ignore",
      }),
    );
    expect(fakeChild.unref).toHaveBeenCalledOnce();
  });
});
