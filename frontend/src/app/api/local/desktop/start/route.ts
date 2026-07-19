import { execFile, spawn, type ChildProcess } from "node:child_process";
import { accessSync, constants, existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const LAUNCH_HEADER = "x-javafx-launcher";
const LAUNCH_HEADER_VALUE = "web-lab";
const DESKTOP_PROCESS_MARKERS = [
  "MavenWrapperMain -pl desktop-app javafx:run",
  "--module edu.group.javafxevents/edu.group.javafxevents.EventHandlingApp",
] as const;

let desktopProcess: ChildProcess | null = null;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function isLocalSameOriginRequest(request: Request): boolean {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    !LOCAL_HOSTS.has(requestUrl.hostname) ||
    request.headers.get(LAUNCH_HEADER) !== LAUNCH_HEADER_VALUE ||
    (fetchSite !== null && fetchSite !== "same-origin")
  ) {
    return false;
  }

  if (origin === null) {
    return fetchSite === "same-origin";
  }

  try {
    const originUrl = new URL(origin);
    return LOCAL_HOSTS.has(originUrl.hostname);
  } catch {
    return false;
  }
}

function findProjectRoot(): string | null {
  const candidates = new Set(
    [process.env.INIT_CWD, process.cwd(), path.resolve(process.cwd(), "..")].filter(
      (candidate): candidate is string => candidate !== undefined,
    ),
  );

  for (const candidate of candidates) {
    if (
      existsSync(path.join(candidate, "mvnw")) &&
      existsSync(path.join(candidate, "desktop-app", "pom.xml"))
    ) {
      return candidate;
    }
  }
  return null;
}

function isDesktopRunning(): boolean {
  return (
    desktopProcess !== null &&
    desktopProcess.exitCode === null &&
    desktopProcess.signalCode === null &&
    !desktopProcess.killed
  );
}

function hasExistingDesktopProcess(): Promise<boolean> {
  if (process.platform === "win32") {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    execFile(
      "/bin/ps",
      ["-ax", "-o", "command="],
      { maxBuffer: 1_048_576, timeout: 2_000 },
      (error, stdout) => {
        if (error !== null) {
          resolve(false);
          return;
        }
        resolve(
          stdout
            .split("\n")
            .some((line) => DESKTOP_PROCESS_MARKERS.some((marker) => line.includes(marker))),
        );
      },
    );
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return errorResponse("The desktop launcher is available only in local development.", 404);
  }
  if (!isLocalSameOriginRequest(request)) {
    return errorResponse("The desktop launcher accepts only local same-origin requests.", 403);
  }
  if (isDesktopRunning() || (await hasExistingDesktopProcess())) {
    return NextResponse.json({
      status: "already-running",
      message: "JavaFX is already running.",
    });
  }

  const projectRoot = findProjectRoot();
  if (projectRoot === null) {
    return errorResponse("The project root or Maven wrapper could not be found.", 500);
  }

  const mavenWrapper = path.join(projectRoot, "mvnw");
  try {
    accessSync(mavenWrapper, constants.X_OK);
    const child = spawn(mavenWrapper, ["-pl", "desktop-app", "javafx:run"], {
      cwd: projectRoot,
      detached: true,
      env: process.env,
      shell: false,
      stdio: "ignore",
    });
    desktopProcess = child;
    child.once("error", () => {
      if (desktopProcess === child) {
        desktopProcess = null;
      }
    });
    child.once("exit", () => {
      if (desktopProcess === child) {
        desktopProcess = null;
      }
    });
    child.unref();
  } catch {
    desktopProcess = null;
    return errorResponse("The JavaFX launch command could not be started.", 500);
  }

  return NextResponse.json({ status: "started", message: "JavaFX is starting." }, { status: 202 });
}
