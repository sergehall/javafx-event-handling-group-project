"use client";

import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  createInteraction,
  getApiHealth,
  getRecentInteractions,
} from "@/features/event-lab/api/interactions-client";
import type {
  InteractionPayload,
  InteractionResponse,
} from "@/features/event-lab/contracts/interaction";

const DEFAULT_GREETING = "Enter your name to begin.";
const DEFAULT_STATUS = "Click anywhere in the playground.";
const MAX_NAME_LENGTH = 40;
const INITIAL_MARKER = { xPercent: 9, yPercent: 24 };

type MarkerStyle = CSSProperties & {
  "--marker-x": string;
  "--marker-y": string;
};

type HistoryState =
  | { status: "loading" }
  | { status: "ready"; interactions: InteractionResponse[] }
  | { status: "error"; message: string };

type SyncState =
  | { status: "idle"; message: string }
  | { status: "syncing"; message: string }
  | { status: "synced"; message: string }
  | { status: "offline"; message: string };

function formatInteraction(interaction: InteractionResponse): string {
  switch (interaction.type) {
    case "GREETING":
      return interaction.message ?? "Greeting";
    case "CANVAS_CLICK":
      return `Canvas click at (${Math.round(interaction.xCoordinate ?? 0)}, ${Math.round(interaction.yCoordinate ?? 0)})`;
    case "RESET":
      return "Lab reset";
  }
}

export function EventLab() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [clickCount, setClickCount] = useState(0);
  const [marker, setMarker] = useState(INITIAL_MARKER);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [history, setHistory] = useState<HistoryState>({ status: "loading" });
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    message: "Local interactions work even when the API is offline.",
  });

  const loadHistory = useCallback(async () => {
    try {
      const [health, interactions] = await Promise.all([getApiHealth(), getRecentInteractions()]);
      setApiStatus(health.status.toUpperCase() === "UP" ? "online" : "offline");
      setHistory({ status: "ready", interactions });
    } catch (error) {
      setApiStatus("offline");
      setHistory({
        status: "error",
        message: error instanceof Error ? error.message : "Interaction history is unavailable.",
      });
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    void Promise.all([getApiHealth(), getRecentInteractions()])
      .then(([health, interactions]) => {
        if (!isCurrent) {
          return;
        }
        setApiStatus(health.status.toUpperCase() === "UP" ? "online" : "offline");
        setHistory({ status: "ready", interactions });
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }
        setApiStatus("offline");
        setHistory({
          status: "error",
          message: error instanceof Error ? error.message : "Interaction history is unavailable.",
        });
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  function handleHistoryRefresh() {
    setHistory({ status: "loading" });
    void loadHistory();
  }

  const persistInteraction = useCallback(async (payload: InteractionPayload) => {
    setSyncState({ status: "syncing", message: "Sending event to the API…" });
    try {
      await createInteraction(payload);
      const interactions = await getRecentInteractions();
      setApiStatus("online");
      setHistory({ status: "ready", interactions });
      setSyncState({ status: "synced", message: "Event saved by the API." });
    } catch {
      setApiStatus("offline");
      setSyncState({
        status: "offline",
        message: "Local event completed, but the API could not save it.",
      });
    }
  }, []);

  function handleGreeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setNameError("Please enter your name.");
      setGreeting("Please enter your name.");
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setNameError("Use a name with 40 characters or fewer.");
      setGreeting("Please use a shorter name.");
      return;
    }

    const nextGreeting = `Hello, ${trimmedName}!`;
    setNameError("");
    setGreeting(nextGreeting);
    setName("");
    void persistInteraction({ type: "GREETING", message: nextGreeting });
  }

  function handlePlaygroundClick(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left;
    const y = event.detail === 0 ? bounds.height / 2 : event.clientY - bounds.top;
    const safeX = Math.max(0, Math.min(x, bounds.width));
    const safeY = Math.max(0, Math.min(y, bounds.height));
    const nextCount = clickCount + 1;

    setClickCount(nextCount);
    setMarker({
      xPercent: bounds.width === 0 ? 0 : (safeX / bounds.width) * 100,
      yPercent: bounds.height === 0 ? 0 : (safeY / bounds.height) * 100,
    });
    setStatus(`Canvas click #${nextCount} at (${Math.round(safeX)}, ${Math.round(safeY)})`);
    void persistInteraction({
      type: "CANVAS_CLICK",
      xCoordinate: safeX,
      yCoordinate: safeY,
    });
  }

  function handleReset() {
    setName("");
    setNameError("");
    setGreeting(DEFAULT_GREETING);
    setStatus(DEFAULT_STATUS);
    setClickCount(0);
    setMarker(INITIAL_MARKER);
    void persistInteraction({ type: "RESET" });
  }

  const markerStyle: MarkerStyle = {
    "--marker-x": `${marker.xPercent}%`,
    "--marker-y": `${marker.yPercent}%`,
  };

  return (
    <div className="lab-shell">
      <section className="lab-card" aria-labelledby="interaction-lab-title">
        <div className="section-heading">
          <div>
            <p className="section-heading__label">Interactive surface</p>
            <h2 id="interaction-lab-title">Try the event handlers</h2>
          </div>
          <span className={`status-pill status-pill--${apiStatus}`}>
            <span aria-hidden="true" />
            API {apiStatus}
          </span>
        </div>

        <form className="greeting-form" onSubmit={handleGreeting} noValidate>
          <label htmlFor="name">Name</label>
          <div className="greeting-form__controls">
            <input
              id="name"
              name="name"
              value={name}
              maxLength={MAX_NAME_LENGTH + 1}
              onChange={(event) => setName(event.target.value)}
              aria-describedby={nameError ? "name-error" : "name-hint"}
              aria-invalid={nameError !== ""}
              placeholder="Type a name and press Enter"
              autoComplete="name"
            />
            <button type="submit">Say hello</button>
          </div>
          <p id={nameError ? "name-error" : "name-hint"} className="field-note">
            {nameError || "Up to 40 characters, matching the JavaFX model."}
          </p>
        </form>

        <p className="greeting-output" aria-live="polite">
          {greeting}
        </p>

        <button
          type="button"
          className="playground"
          style={markerStyle}
          onClick={handlePlaygroundClick}
          aria-describedby="playground-status"
        >
          <span className="playground__anchor" aria-hidden="true" />
          <span className="playground__target" aria-hidden="true" />
          <span className="playground__marker" aria-hidden="true" />
          <span className="sr-only">
            Record a canvas click. Keyboard activation records the center point.
          </span>
        </button>

        <div className="lab-footer">
          <div>
            <p id="playground-status" className="canvas-status" aria-live="polite">
              {status}
            </p>
            <p className={`sync-message sync-message--${syncState.status}`} aria-live="polite">
              {syncState.message}
            </p>
          </div>
          <button type="button" className="button-secondary" onClick={handleReset}>
            Reset lab
          </button>
        </div>
      </section>

      <aside className="side-column" aria-label="API tools and launch instructions">
        <section className="side-card" aria-labelledby="history-title">
          <div className="side-card__heading">
            <div>
              <p className="section-heading__label">Spring Boot API</p>
              <h2 id="history-title">Recent events</h2>
            </div>
            <button type="button" className="button-text" onClick={handleHistoryRefresh}>
              Refresh
            </button>
          </div>

          {history.status === "loading" && (
            <p className="empty-state" role="status">
              Loading interaction history…
            </p>
          )}
          {history.status === "error" && (
            <div className="empty-state empty-state--error" role="status">
              <strong>API history is offline.</strong>
              <span>{history.message}</span>
            </div>
          )}
          {history.status === "ready" && history.interactions.length === 0 && (
            <p className="empty-state">No saved events yet.</p>
          )}
          {history.status === "ready" && history.interactions.length > 0 && (
            <ol className="history-list">
              {history.interactions.map((interaction) => (
                <li key={interaction.id}>
                  <span>{formatInteraction(interaction)}</span>
                  <time dateTime={interaction.createdAt}>
                    {new Intl.DateTimeFormat(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(new Date(interaction.createdAt))}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="side-card launch-card" aria-labelledby="launch-title">
          <p className="section-heading__label">Desktop assignment</p>
          <h2 id="launch-title">Launch JavaFX separately</h2>
          <p>
            The browser lab is optional. The graded JavaFX/FXML application remains standalone and
            starts without this frontend or the API.
          </p>
          <code>./mvnw -pl desktop-app javafx:run</code>
        </section>
      </aside>
    </div>
  );
}
