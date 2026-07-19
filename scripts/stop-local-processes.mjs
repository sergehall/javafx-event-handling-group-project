import { execFile } from "node:child_process";
import { constants } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const STOP_TIMEOUT_MILLISECONDS = 3_000;
const MAX_COMMAND_DISPLAY_LENGTH = 160;
const MODE = process.argv[2] ?? "all";
const VALID_MODES = new Set(["web", "desktop", "all"]);

const WEB_TARGETS = [
  { label: "Next.js frontend", port: 3_000 },
  { label: "Spring Boot API", port: 8_081 },
];

const DESKTOP_PROCESS_MARKERS = [
  "MavenWrapperMain -pl desktop-app javafx:run",
  "--module edu.group.javafxevents/edu.group.javafxevents.EventHandlingApp",
];

function isInsideProject(candidatePath) {
  const relativePath = path.relative(PROJECT_ROOT, candidatePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

async function run(command, argumentsList) {
  try {
    return await execFileAsync(command, argumentsList, {
      encoding: "utf8",
      maxBuffer: 1_048_576,
    });
  } catch (error) {
    if (error.code === 1) {
      return { stdout: "", stderr: "" };
    }
    throw error;
  }
}

async function findListeningProcessIds(port) {
  const { stdout } = await run("/usr/sbin/lsof", [
    "-nP",
    `-iTCP:${port}`,
    "-sTCP:LISTEN",
    "-t",
  ]);

  return [
    ...new Set(
      stdout
        .split("\n")
        .map(Number)
        .filter((processId) => Number.isInteger(processId) && processId > 0),
    ),
  ];
}

async function getProcessWorkingDirectory(processId) {
  const { stdout } = await run("/usr/sbin/lsof", [
    "-a",
    "-p",
    String(processId),
    "-d",
    "cwd",
    "-Fn",
  ]);
  const directoryLine = stdout.split("\n").find((line) => line.startsWith("n"));
  return directoryLine?.slice(1) ?? null;
}

async function getProcessCommand(processId) {
  const { stdout } = await run("/bin/ps", [
    "-p",
    String(processId),
    "-o",
    "command=",
  ]);
  return stdout.trim();
}

async function belongsToProject(processId) {
  const workingDirectory = await getProcessWorkingDirectory(processId);
  if (workingDirectory !== null && isInsideProject(workingDirectory)) {
    return true;
  }

  return (await getProcessCommand(processId)).includes(PROJECT_ROOT);
}

function isRunning(processId) {
  try {
    process.kill(processId, 0);
    return true;
  } catch {
    return false;
  }
}

function summarizeCommand(command) {
  if (command.length <= MAX_COMMAND_DISPLAY_LENGTH) {
    return command;
  }
  return `${command.slice(0, MAX_COMMAND_DISPLAY_LENGTH - 1)}…`;
}

async function stopProcess(processId, label) {
  if (!isRunning(processId)) {
    return;
  }

  const command = await getProcessCommand(processId);
  console.log(
    `Stopping ${label} (PID ${processId}): ${summarizeCommand(command) || "unknown command"}`,
  );
  process.kill(processId, constants.signals.SIGTERM);

  const deadline = Date.now() + STOP_TIMEOUT_MILLISECONDS;
  while (isRunning(processId) && Date.now() < deadline) {
    await delay(100);
  }

  if (isRunning(processId)) {
    console.warn(
      `${label} did not stop gracefully; sending SIGKILL to PID ${processId}.`,
    );
    process.kill(processId, constants.signals.SIGKILL);
  }
}

async function stopWebProcesses() {
  let foundProcess = false;

  for (const target of WEB_TARGETS) {
    const processIds = await findListeningProcessIds(target.port);
    if (processIds.length === 0) {
      console.log(
        `${target.label}: nothing is listening on port ${target.port}.`,
      );
      continue;
    }

    foundProcess = true;
    for (const processId of processIds) {
      if (!(await belongsToProject(processId))) {
        const command = await getProcessCommand(processId);
        throw new Error(
          `Refusing to stop PID ${processId} on port ${target.port}; it does not belong to this project (${command}).`,
        );
      }
      await stopProcess(processId, target.label);
    }
  }

  if (!foundProcess) {
    console.log("No project web processes were running.");
  }
}

async function findDesktopProcessIds() {
  const { stdout } = await run("/bin/ps", ["-ax", "-o", "pid=,command="]);
  const candidates = stdout
    .split("\n")
    .map((line) => line.trim().match(/^(\d+)\s+(.+)$/))
    .filter((match) =>
      match === null
        ? false
        : DESKTOP_PROCESS_MARKERS.some((marker) => match[2].includes(marker)),
    )
    .map((match) => Number(match[1]));

  const projectProcessIds = [];
  for (const processId of new Set(candidates)) {
    if (await belongsToProject(processId)) {
      projectProcessIds.push(processId);
    }
  }
  return projectProcessIds;
}

async function stopDesktopProcesses() {
  const processIds = await findDesktopProcessIds();
  if (processIds.length === 0) {
    console.log("JavaFX desktop application: not running.");
    return;
  }

  for (const processId of processIds) {
    await stopProcess(processId, "JavaFX desktop application");
  }
}

async function main() {
  if (!VALID_MODES.has(MODE)) {
    throw new Error(
      `Unknown stop mode '${MODE}'. Expected web, desktop, or all.`,
    );
  }

  if (MODE === "web" || MODE === "all") {
    await stopWebProcesses();
  }
  if (MODE === "desktop" || MODE === "all") {
    await stopDesktopProcesses();
  }

  console.log("Selected local project processes are stopped.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
