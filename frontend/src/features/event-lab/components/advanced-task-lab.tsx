"use client";

import type { FormEvent } from "react";
import { useMemo, useRef, useState } from "react";

const MAX_TASK_LENGTH = 80;

type Priority = "high" | "medium" | "low";
type TaskFilter = "all" | "active" | "completed";

type Task = Readonly<{
  id: number;
  title: string;
  priority: Priority;
  completed: boolean;
}>;

const INITIAL_TASKS: readonly Task[] = [
  { id: 1, title: "Design the JavaFX task layout", priority: "high", completed: true },
  { id: 2, title: "Connect add and remove handlers", priority: "medium", completed: false },
  { id: 3, title: "Record the final walkthrough", priority: "low", completed: false },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const satisfies readonly { value: TaskFilter; label: string }[];

function matchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter === "active") {
    return !task.completed;
  }
  if (filter === "completed") {
    return task.completed;
  }
  return true;
}

export function AdvancedTaskLab() {
  const [tasks, setTasks] = useState<readonly Task[]>(INITIAL_TASKS);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [error, setError] = useState("");
  const nextTaskId = useRef(4);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const visibleTasks = useMemo(
    () => tasks.filter((task) => matchesFilter(task, filter)),
    [filter, tasks],
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
        completed: false,
      },
    ]);
    nextTaskId.current += 1;
    setTitle("");
    setError("");
  }

  function toggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function removeTask(taskId: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  function clearCompleted() {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  }

  return (
    <section className="advanced-lab" aria-labelledby="advanced-workspace-title">
      <header className="advanced-lab__header">
        <div>
          <p className="section-heading__label">Task command center</p>
          <h2 id="advanced-workspace-title">Plan, prioritize, complete.</h2>
          <p>
            Explore a richer event-handling flow built around the JavaFX assignment requirements.
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
          <span>In progress</span>
          <strong>{activeCount}</strong>
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
          <label htmlFor="advanced-task-priority">Priority</label>
          <select
            id="advanced-task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
        <div className="advanced-filters" aria-label="Filter tasks">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
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
            <li key={task.id} className={task.completed ? "advanced-task--completed" : undefined}>
              <input
                id={`advanced-task-${task.id}`}
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
              />
              <label htmlFor={`advanced-task-${task.id}`}>
                <strong>{task.title}</strong>
                <span className={`priority-badge priority-badge--${task.priority}`}>
                  {task.priority} priority
                </span>
              </label>
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
