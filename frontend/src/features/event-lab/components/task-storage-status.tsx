import type { TaskConnectionState } from "@/features/event-lab/hooks/use-shared-tasks";

type TaskStorageStatusProps = Readonly<{
  state: TaskConnectionState;
  isSyncing: boolean;
  onRefresh: () => void;
}>;

const STATUS_COPY = {
  loading: { title: "Connecting", detail: "Shared task API" },
  online: { title: "Database online", detail: "Shared with JavaFX" },
  offline: { title: "Database offline", detail: "Changes are paused" },
} as const;

export function TaskStorageStatus({ state, isSyncing, onRefresh }: TaskStorageStatusProps) {
  const copy = STATUS_COPY[state];
  return (
    <div className={`task-storage-status task-storage-status--${state}`} role="status">
      <span className="task-storage-status__dot" aria-hidden="true" />
      <span>
        <strong>{isSyncing && state === "online" ? "Synchronizing" : copy.title}</strong>
        <small>{copy.detail}</small>
      </span>
      <button type="button" onClick={onRefresh} disabled={isSyncing || state === "loading"}>
        {state === "offline" ? "Retry" : "Refresh"}
      </button>
    </div>
  );
}
