"use client";

import { useState } from "react";
import { startDesktopApp } from "@/features/event-lab/api/desktop-launcher-client";

type LauncherState = "idle" | "starting" | "started" | "error";

export function DesktopLauncherButton() {
  const [state, setState] = useState<LauncherState>("idle");
  const [message, setMessage] = useState("Launch the local desktop app");

  async function handleLaunch() {
    setState("starting");
    setMessage("Starting desktop app…");

    try {
      const response = await startDesktopApp();
      setState("started");
      setMessage(response.message);
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "The JavaFX application could not start.",
      );
    }
  }

  return (
    <button
      type="button"
      className="desktop-launcher-button"
      data-state={state}
      disabled={state === "starting"}
      onClick={() => void handleLaunch()}
    >
      <span>{state === "starting" ? "Opening JavaFX…" : "Open JavaFX"}</span>
      <small aria-live="polite">{message}</small>
    </button>
  );
}
