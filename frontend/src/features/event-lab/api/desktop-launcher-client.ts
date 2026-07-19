import {
  desktopLauncherErrorSchema,
  desktopLauncherResponseSchema,
  type DesktopLauncherResponse,
} from "@/features/event-lab/contracts/desktop-launcher";

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error("The desktop launcher returned an unreadable response.");
  }
}

export async function startDesktopApp(): Promise<DesktopLauncherResponse> {
  const response = await fetch("/api/local/desktop/start", {
    method: "POST",
    headers: { "X-JavaFX-Launcher": "web-lab" },
  });
  const body = await readJson(response);

  if (!response.ok) {
    const error = desktopLauncherErrorSchema.safeParse(body);
    throw new Error(error.success ? error.data.message : "The JavaFX application could not start.");
  }

  return desktopLauncherResponseSchema.parse(body);
}
