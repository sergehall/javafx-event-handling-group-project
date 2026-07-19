"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { TaskStorageStatus } from "@/features/event-lab/components/task-storage-status";
import {
  MAX_TASK_LENGTH,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/features/event-lab/contracts/task";
import { useSharedTasks } from "@/features/event-lab/hooks/use-shared-tasks";

type StatusFilter = "ALL" | TaskStatus;
type PriorityFilter = "ALL" | TaskPriority;

const PRIORITIES = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const satisfies readonly { value: TaskPriority; label: string }[];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "COMPLETED", label: "Completed" },
] as const satisfies readonly { value: TaskStatus; label: string }[];

const STATUS_FILTERS = [{ value: "ALL", label: "All" }, ...STATUSES] as const satisfies readonly {
  value: StatusFilter;
  label: string;
}[];

const PRIORITY_FILTERS = [
  { value: "ALL", label: "All" },
  ...PRIORITIES,
] as const satisfies readonly { value: PriorityFilter; label: string }[];

function matchesFilters(
  task: Task,
  statusFilter: StatusFilter,
  priorityFilter: PriorityFilter,
): boolean {
  const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
  const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
  return matchesStatus && matchesPriority;
}

function priorityClass(priority: TaskPriority): string {
  return priority.toLowerCase();
}

function statusClass(status: TaskStatus): string {
  return status === "IN_REVIEW" ? "review" : status.toLowerCase();
}

export function AdvancedTaskLab() {
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
    clearCompletedTasks,
  } = useSharedTasks();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [error, setError] = useState("");

  const activeCount = tasks.filter((task) => task.status === "ACTIVE").length;
  const reviewCount = tasks.filter((task) => task.status === "IN_REVIEW").length;
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesFilters(task, statusFilter, priorityFilter)),
    [priorityFilter, statusFilter, tasks],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const result = await createTask({ title: nextTitle, priority });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setTitle("");
    setError("");
  }

  async function updateTaskPriority(taskId: number, nextPriority: TaskPriority) {
    const result = await updateTask(taskId, { priority: nextPriority });
    if (!result.ok) {
      setError(result.message);
    }
  }

  async function updateTaskStatus(taskId: number, nextStatus: TaskStatus) {
    const result = await updateTask(taskId, { status: nextStatus });
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

  async function clearCompleted() {
    const result = await clearCompletedTasks();
    if (!result.ok) {
      setError(result.message);
    }
  }

  return (
    <section className="advanced-lab" aria-labelledby="advanced-workspace-title">
      <header className="advanced-lab__header">
        <div>
          <p className="section-heading__label">Task command center</p>
          <h2 id="advanced-workspace-title">Plan, prioritize, review, deliver.</h2>
          <p>
            Use the same professional task workflow as the JavaFX application, with synchronized
            status, priority, filters, and delivery progress.
          </p>
        </div>
        <div className="advanced-lab__summary">
          <TaskStorageStatus
            state={connectionState}
            isSyncing={isSynchronizing}
            onRefresh={() => void refresh()}
          />
          <div className="advanced-lab__completion" aria-label={`${progress}% complete`}>
            <strong>{progress}%</strong>
            <span>complete</span>
          </div>
        </div>
      </header>

      <div className="advanced-stats" aria-label="Task statistics">
        <div>
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>In review</span>
          <strong>{reviewCount}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="advanced-progress">
          <span>Overall progress</span>
          <div
            role="progressbar"
            aria-label="Overall task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <form className="advanced-task-form" onSubmit={handleSubmit} noValidate>
        <div className="advanced-task-form__field">
          <label htmlFor="advanced-task-title">New task</label>
          <input
            id="advanced-task-title"
            value={title}
            maxLength={MAX_TASK_LENGTH + 1}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            aria-describedby={error ? "advanced-task-error" : "advanced-task-hint"}
            aria-invalid={error !== ""}
            placeholder="What needs to be done?"
          />
        </div>
        <div className="advanced-task-form__field advanced-task-form__priority">
          <label htmlFor="advanced-task-priority">Task priority</label>
          <select
            id="advanced-task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            disabled={!canMutate}
          >
            {PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={!canMutate}>
          {isMutating ? "Saving…" : "Add task"}
        </button>
        <p
          id={error ? "advanced-task-error" : "advanced-task-hint"}
          className={`advanced-task-form__message${error ? " advanced-task-form__message--error" : ""}`}
        >
          {error ||
            (connectionState === "offline"
              ? "Start PostgreSQL and group-api, then choose Retry."
              : `Use Enter or Add task. Maximum ${MAX_TASK_LENGTH} characters.`)}
        </p>
      </form>

      <div className="advanced-toolbar">
        <div className="advanced-toolbar__controls">
          <span className="advanced-filter-label">Show</span>
          <div className="advanced-status-filters" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="advanced-filter-label" htmlFor="advanced-priority-filter">
            Priority
          </label>
          <select
            id="advanced-priority-filter"
            className="advanced-priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
          >
            {PRIORITY_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="clear-completed"
          disabled={completedCount === 0 || !canMutate}
          onClick={() => void clearCompleted()}
        >
          Clear completed
        </button>
      </div>

      {connectionState === "loading" ? (
        <div className="advanced-empty-state" role="status">
          <strong>Loading shared tasks…</strong>
          <span>Connecting to the same task list used by JavaFX.</span>
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="advanced-empty-state" role="status">
          <strong>No tasks in this view.</strong>
          <span>
            {connectionState === "offline"
              ? "Task storage is unavailable. Choose Retry when the API is running."
              : "Add a task or choose another filter."}
          </span>
        </div>
      ) : (
        <ul className="advanced-task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className={task.status === "COMPLETED" ? "advanced-task--completed" : undefined}
            >
              <select
                className={`task-priority-control task-priority-control--${priorityClass(task.priority)}`}
                value={task.priority}
                disabled={!canMutate}
                onChange={(event) =>
                  void updateTaskPriority(task.id, event.target.value as TaskPriority)
                }
                aria-label={`Priority for "${task.title}"`}
              >
                {PRIORITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className={`task-status-control task-status-control--${statusClass(task.status)}`}
                value={task.status}
                disabled={!canMutate}
                onChange={(event) =>
                  void updateTaskStatus(task.id, event.target.value as TaskStatus)
                }
                aria-label={`Status for "${task.title}"`}
              >
                {STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <strong className="advanced-task__title">{task.title}</strong>
              <button
                type="button"
                className="advanced-task__remove"
                disabled={!canMutate}
                onClick={() => void handleRemoveTask(task.id)}
                aria-label={`Remove "${task.title}"`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
