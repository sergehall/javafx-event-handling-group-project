import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const FRONTEND_URL = "http://127.0.0.1:3000";
const MAX_ATTEMPTS = 60;
const RETRY_DELAY_MILLISECONDS = 500;

async function waitForFrontend() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(FRONTEND_URL, {
        signal: AbortSignal.timeout(1_000),
      });

      if (response.ok) {
        return;
      }
    } catch {
      // The development server is still starting.
    }

    await delay(RETRY_DELAY_MILLISECONDS);
  }

  throw new Error(`Frontend did not become ready at ${FRONTEND_URL}.`);
}

function getBrowserCommand() {
  if (process.platform === "darwin") {
    return { command: "open", arguments: [FRONTEND_URL] };
  }

  if (process.platform === "win32") {
    return { command: "cmd", arguments: ["/c", "start", "", FRONTEND_URL] };
  }

  return { command: "xdg-open", arguments: [FRONTEND_URL] };
}

async function openFrontend() {
  await waitForFrontend();

  const browserCommand = getBrowserCommand();

  await new Promise((resolve, reject) => {
    const browserProcess = spawn(
      browserCommand.command,
      browserCommand.arguments,
      { detached: true, stdio: "ignore" },
    );

    browserProcess.once("error", reject);
    browserProcess.once("spawn", () => {
      browserProcess.unref();
      resolve();
    });
  });

  console.log(`Opened frontend in the default browser: ${FRONTEND_URL}`);
}

await openFrontend();
