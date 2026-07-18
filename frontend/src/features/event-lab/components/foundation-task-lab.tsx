"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";

const MAX_TASK_LENGTH = 80;

type FoundationTask = Readonly<{
  id: number;
  title: string;
  completed: boolean;
}>;

const INITIAL_TASKS: readonly FoundationTask[] = [
  { id: 1, title: "Design the JavaFX layout", completed: true },
  { id: 2, title: "Connect task event handlers", completed: false },
];

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
  const [tasks, setTasks] = useState<readonly FoundationTask[]>(INITIAL_TASKS);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const nextTaskId = useRef(3);

  const completedCount = tasks.filter((task) => task.completed).length;

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
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
      { id: nextTaskId.current, title: nextTitle, completed: false },
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

  return (
    <div className="foundation-lab-shell">
      <section className="foundation-task-panel" aria-labelledby="foundation-list-title">
        <div className="foundation-task-panel__heading">
          <div>
            <p className="section-heading__label">JavaFX assignment mirror</p>
            <h2 id="foundation-list-title">My task list</h2>
          </div>
          <span>
            {completedCount}/{tasks.length} complete
          </span>
        </div>

        <form className="foundation-task-form" onSubmit={handleAddTask} noValidate>
          <label htmlFor="foundation-task-title">New task</label>
          <div>
            <input
              id="foundation-task-title"
              value={title}
              maxLength={MAX_TASK_LENGTH + 1}
              onChange={(event) => setTitle(event.target.value)}
              aria-describedby={error ? "foundation-task-error" : "foundation-task-hint"}
              aria-invalid={error !== ""}
              placeholder="What needs to be done?"
            />
            <button type="submit">Add Task</button>
          </div>
          <p
            id={error ? "foundation-task-error" : "foundation-task-hint"}
            className={error ? "foundation-task-form__error" : undefined}
          >
            {error || "Press Enter or use Add Task. Maximum 80 characters."}
          </p>
        </form>

        {tasks.length === 0 ? (
          <div className="foundation-empty-state" role="status">
            <strong>No tasks yet</strong>
            <span>Add a task above to begin your list.</span>
          </div>
        ) : (
          <ul className="foundation-task-list" aria-label="Foundation tasks">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={task.completed ? "foundation-task--completed" : undefined}
              >
                <input
                  id={`foundation-task-${task.id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
                />
                <label htmlFor={`foundation-task-${task.id}`}>{task.title}</label>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
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
