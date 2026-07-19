import { vi } from "vitest";
import type { Task, TaskPriority } from "@/features/event-lab/contracts/task";

const NOW = "2026-07-18T12:00:00Z";

export const TEST_TASKS: readonly Task[] = [
  {
    id: 1,
    title: "Design the JavaFX task layout",
    priority: "HIGH",
    status: "COMPLETED",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: "Connect add and remove handlers",
    priority: "MEDIUM",
    status: "ACTIVE",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: "Record the final walkthrough",
    priority: "LOW",
    status: "IN_REVIEW",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

function requestPath(input: RequestInfo | URL): string {
  const value = input instanceof Request ? input.url : String(input);
  return new URL(value, "http://localhost").pathname;
}

export function installTaskApiMock(seed: readonly Task[] = TEST_TASKS) {
  let tasks = seed.map((task) => ({ ...task }));
  let nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1;

  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const path = requestPath(input);
    const method = init?.method ?? "GET";

    if (path === "/api/group/tasks" && method === "GET") {
      return Response.json(tasks);
    }

    if (path === "/api/group/tasks" && method === "POST") {
      const request = JSON.parse(String(init?.body)) as {
        title: string;
        priority?: TaskPriority;
      };
      const created: Task = {
        id: nextId,
        title: request.title,
        priority: request.priority ?? "MEDIUM",
        status: "ACTIVE",
        createdAt: NOW,
        updatedAt: NOW,
      };
      nextId += 1;
      tasks = [...tasks, created];
      return Response.json(created, { status: 201 });
    }

    if (path === "/api/group/tasks/completed" && method === "DELETE") {
      const previousLength = tasks.length;
      tasks = tasks.filter((task) => task.status !== "COMPLETED");
      return Response.json({ removedCount: previousLength - tasks.length });
    }

    const taskMatch = /^\/api\/group\/tasks\/(\d+)$/.exec(path);
    const taskId = taskMatch?.[1] === undefined ? null : Number(taskMatch[1]);
    if (taskId !== null && method === "PATCH") {
      const request = JSON.parse(String(init?.body)) as Partial<Pick<Task, "priority" | "status">>;
      let updated: Task | undefined;
      tasks = tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        updated = { ...task, ...request, updatedAt: NOW };
        return updated;
      });
      return updated === undefined
        ? Response.json({ message: "Task not found." }, { status: 404 })
        : Response.json(updated);
    }

    if (taskId !== null && method === "DELETE") {
      tasks = tasks.filter((task) => task.id !== taskId);
      return new Response(null, { status: 204 });
    }

    return Response.json({ message: "Unexpected task request." }, { status: 500 });
  });

  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    getTasks: () => tasks,
  } as const;
}
