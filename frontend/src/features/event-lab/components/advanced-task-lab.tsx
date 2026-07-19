"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";

const MAX_TASK_LENGTH = 80;

type Priority = "high" | "medium" | "low";
type TaskStatus = "active" | "review" | "completed";
type StatusFilter = "all" | TaskStatus;
type PriorityFilter = "all" | Priority;

type Task = Readonly<{
  id: number;
  title: string;
  priority: Priority;
  status: TaskStatus;
}>;

const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: "Design the JavaFX task layout", priority: "high", status: "completed" },
  { id: 2, title: "Connect add and remove handlers", priority: "medium", status: "active" },
  { id: 3, title: "Record the final walkthrough", priority: "low", status: "review" },
];

const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const satisfies readonly { value: Priority; label: string }[];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "review", label: "In Review" },
  { value: "completed", label: "Completed" },
] as const satisfies readonly { value: TaskStatus; label: string }[];

const STATUS_FILTERS = [{ value: "all", label: "All" }, ...STATUSES] as const satisfies readonly {
  value: StatusFilter;
  label: string;
}[];

const PRIORITY_FILTERS = [
  { value: "all", label: "All" },
  ...PRIORITIES,
] as const satisfies readonly { value: PriorityFilter; label: string }[];

function matchesFilters(
  task: Task,
  statusFilter: StatusFilter,
  priorityFilter: PriorityFilter,
): boolean {
  const matchesStatus = statusFilter === "all" || task.status === statusFilter;
  const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
  return matchesStatus && matchesPriority;
}

export function AdvancedTaskLab() {
  const [tasks, setTasks] = useState<readonly Task[]>(INITIAL_TASKS);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [error, setError] = useState("");
  const nextTaskId = useRef(4);

  const activeCount = tasks.filter((task) => task.status === "active").length;
  const reviewCount = tasks.filter((task) => task.status === "review").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesFilters(task, statusFilter, priorityFilter)),
    [priorityFilter, statusFilter, tasks],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: nextTaskId.current,
        title: nextTitle,
        priority,
        status: "active",
      },
    ]);
    nextTaskId.current += 1;
    setTitle("");
    setError("");
  }

  function updateTaskPriority(taskId: number, nextPriority: Priority) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, priority: nextPriority } : task)),
    );
  }

  function updateTaskStatus(taskId: number, nextStatus: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)),
    );
  }

  function removeTask(taskId: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  function clearCompleted() {
    setTasks((currentTasks) => currentTasks.filter((task) => task.status !== "completed"));
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
        <div className="advanced-lab__completion" aria-label={`${progress}% complete`}>
          <strong>{progress}%</strong>
          <span>complete</span>
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
            onChange={(event) => setTitle(event.target.value)}
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
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            {PRIORITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add task</button>
        <p
          id={error ? "advanced-task-error" : "advanced-task-hint"}
          className={`advanced-task-form__message${error ? " advanced-task-form__message--error" : ""}`}
        >
          {error || `Use Enter or Add task. Maximum ${MAX_TASK_LENGTH} characters.`}
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
          disabled={completedCount === 0}
          onClick={clearCompleted}
        >
          Clear completed
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="advanced-empty-state" role="status">
          <strong>No tasks in this view.</strong>
          <span>Add a task or choose another filter.</span>
        </div>
      ) : (
        <ul className="advanced-task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className={task.status === "completed" ? "advanced-task--completed" : undefined}
            >
              <select
                className={`task-priority-control task-priority-control--${task.priority}`}
                value={task.priority}
                onChange={(event) => updateTaskPriority(task.id, event.target.value as Priority)}
                aria-label={`Priority for "${task.title}"`}
              >
                {PRIORITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className={`task-status-control task-status-control--${task.status}`}
                value={task.status}
                onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}
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
                onClick={() => removeTask(task.id)}
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
