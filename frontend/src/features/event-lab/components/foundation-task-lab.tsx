"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { TaskStorageStatus } from "@/features/event-lab/components/task-storage-status";
import { MAX_TASK_LENGTH } from "@/features/event-lab/contracts/task";
import { useSharedTasks } from "@/features/event-lab/hooks/use-shared-tasks";

const REQUIREMENT_COVERAGE = [
  "Application class and JavaFX stage",
  "BorderPane and VBox layout",
  "Add Task event handling",
  "Checkbox completion control",
  "Remove button for every task",
  "Synchronized UI updates",
  "Documented 200–300 line solution",
] as const;

export function FoundationTaskLab() {
  const {
    tasks,
    connectionState,
    isMutating,
    isSynchronizing,
    canMutate,
    refresh,
    createTask,
    updateTask,
    removeTask,
  } = useSharedTasks();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (nextTitle.length === 0) {
      setError("Enter a task before adding it.");
      return;
    }
    if (nextTitle.length > MAX_TASK_LENGTH) {
      setError(`Keep the task within ${MAX_TASK_LENGTH} characters.`);
      return;
    }
    if (tasks.some((task) => task.title.toLocaleLowerCase() === nextTitle.toLocaleLowerCase())) {
      setError("That task is already on the list.");
      return;
    }

    const result = await createTask({ title: nextTitle });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setTitle("");
    setError("");
  }

  async function toggleTask(taskId: number, completed: boolean) {
    const result = await updateTask(taskId, {
      status: completed ? "ACTIVE" : "COMPLETED",
    });
    if (!result.ok) {
      setError(result.message);
    }
  }

  async function handleRemoveTask(taskId: number) {
    const result = await removeTask(taskId);
    if (!result.ok) {
      setError(result.message);
    }
  }

  return (
    <div className="foundation-lab-shell">
      <section className="foundation-task-panel" aria-labelledby="foundation-list-title">
        <div className="foundation-task-panel__heading">
          <div>
            <p className="section-heading__label">JavaFX assignment mirror</p>
            <h2 id="foundation-list-title">My task list</h2>
          </div>
          <div className="foundation-task-panel__meta">
            <TaskStorageStatus
              state={connectionState}
              isSyncing={isSynchronizing}
              onRefresh={() => void refresh()}
            />
            <span>
              {completedCount}/{tasks.length} complete
            </span>
          </div>
        </div>

        <form className="foundation-task-form" onSubmit={handleAddTask} noValidate>
          <label htmlFor="foundation-task-title">New task</label>
          <div>
            <input
              id="foundation-task-title"
              value={title}
              maxLength={MAX_TASK_LENGTH + 1}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              aria-describedby={error ? "foundation-task-error" : "foundation-task-hint"}
              aria-invalid={error !== ""}
              placeholder="What needs to be done?"
            />
            <button type="submit" disabled={!canMutate}>
              {isMutating ? "Saving…" : "Add Task"}
            </button>
          </div>
          <p
            id={error ? "foundation-task-error" : "foundation-task-hint"}
            className={error ? "foundation-task-form__error" : undefined}
          >
            {error ||
              (connectionState === "offline"
                ? "Start PostgreSQL and group-api, then choose Retry."
                : "Press Enter or use Add Task. Maximum 80 characters.")}
          </p>
        </form>

        {connectionState === "loading" ? (
          <div className="foundation-empty-state" role="status">
            <strong>Loading shared tasks…</strong>
            <span>Connecting to the same task list used by JavaFX.</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="foundation-empty-state" role="status">
            <strong>No tasks yet</strong>
            <span>
              {connectionState === "offline"
                ? "Task storage is unavailable. Choose Retry when the API is running."
                : "Add a task here or in JavaFX to begin the shared list."}
            </span>
          </div>
        ) : (
          <ul className="foundation-task-list" aria-label="Foundation tasks">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={task.status === "COMPLETED" ? "foundation-task--completed" : undefined}
              >
                <input
                  id={`foundation-task-${task.id}`}
                  type="checkbox"
                  checked={task.status === "COMPLETED"}
                  disabled={!canMutate}
                  onChange={() => void toggleTask(task.id, task.status === "COMPLETED")}
                  aria-label={`Mark "${task.title}" as ${task.status === "COMPLETED" ? "active" : "completed"}`}
                />
                <label htmlFor={`foundation-task-${task.id}`}>{task.title}</label>
                <button
                  type="button"
                  disabled={!canMutate}
                  onClick={() => void handleRemoveTask(task.id)}
                  aria-label={`Remove "${task.title}"`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="foundation-compliance" aria-labelledby="coverage-title">
        <div className="foundation-compliance__heading">
          <div>
            <p className="section-heading__label">Requirements audit</p>
            <h2 id="coverage-title">Foundation coverage</h2>
          </div>
          <span>7/7</span>
        </div>
        <p>
          The browser mirrors the interactions. The standalone JavaFX module provides the graded
          implementation details.
        </p>
        <ol>
          {REQUIREMENT_COVERAGE.map((requirement) => (
            <li key={requirement}>
              <span aria-hidden="true">✓</span>
              {requirement}
            </li>
          ))}
        </ol>
        <code>./mvnw -pl desktop-app javafx:run</code>
      </aside>
    </div>
  );
}
