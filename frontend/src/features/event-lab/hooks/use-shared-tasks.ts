"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearCompletedTasks as clearCompletedTasksRequest,
  createTask as createTaskRequest,
  listTasks,
  removeTask as removeTaskRequest,
  TaskClientError,
  updateTask as updateTaskRequest,
} from "@/features/event-lab/api/tasks-client";
import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "@/features/event-lab/contracts/task";

const BACKGROUND_REFRESH_MS = 5_000;

export type TaskConnectionState = "loading" | "online" | "offline";
export type TaskActionResult<T = undefined> =
  Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; message: string }>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The task request was not successful.";
}

export function useSharedTasks() {
  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [connectionState, setConnectionState] = useState<TaskConnectionState>("loading");
  const [isMutating, setIsMutating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mutationVersion = useRef(0);

  const refresh = useCallback(async (): Promise<TaskActionResult<readonly Task[]>> => {
    const versionAtRequestStart = mutationVersion.current;
    setIsRefreshing(true);
    try {
      const nextTasks = await listTasks();
      if (versionAtRequestStart === mutationVersion.current) {
        setTasks(nextTasks);
      }
      setConnectionState("online");
      return { ok: true, value: nextTasks };
    } catch (error) {
      setConnectionState("offline");
      return { ok: false, message: errorMessage(error) };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function synchronize() {
      const versionAtRequestStart = mutationVersion.current;
      try {
        const nextTasks = await listTasks();
        if (active && versionAtRequestStart === mutationVersion.current) {
          setTasks(nextTasks);
          setConnectionState("online");
        }
      } catch {
        if (active && versionAtRequestStart === mutationVersion.current) {
          setConnectionState("offline");
        }
      }
    }

    void synchronize();
    const timer = window.setInterval(() => void synchronize(), BACKGROUND_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const createTask = useCallback(
    async (request: CreateTaskRequest): Promise<TaskActionResult<Task>> => {
      mutationVersion.current += 1;
      setIsMutating(true);
      try {
        const created = await createTaskRequest(request);
        mutationVersion.current += 1;
        setTasks((current) => [...current, created]);
        setConnectionState("online");
        return { ok: true, value: created };
      } catch (error) {
        if (error instanceof TaskClientError && error.unavailable) {
          setConnectionState("offline");
        }
        return { ok: false, message: errorMessage(error) };
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const updateTask = useCallback(
    async (taskId: number, request: UpdateTaskRequest): Promise<TaskActionResult<Task>> => {
      mutationVersion.current += 1;
      setIsMutating(true);
      try {
        const updated = await updateTaskRequest(taskId, request);
        mutationVersion.current += 1;
        setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));
        setConnectionState("online");
        return { ok: true, value: updated };
      } catch (error) {
        if (error instanceof TaskClientError && error.unavailable) {
          setConnectionState("offline");
        }
        return { ok: false, message: errorMessage(error) };
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const removeTask = useCallback(async (taskId: number): Promise<TaskActionResult> => {
    mutationVersion.current += 1;
    setIsMutating(true);
    try {
      await removeTaskRequest(taskId);
      mutationVersion.current += 1;
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setConnectionState("online");
      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof TaskClientError && error.unavailable) {
        setConnectionState("offline");
      }
      return { ok: false, message: errorMessage(error) };
    } finally {
      setIsMutating(false);
    }
  }, []);

  const clearCompletedTasks = useCallback(async (): Promise<TaskActionResult<number>> => {
    mutationVersion.current += 1;
    setIsMutating(true);
    try {
      const response = await clearCompletedTasksRequest();
      mutationVersion.current += 1;
      setTasks((current) => current.filter((task) => task.status !== "COMPLETED"));
      setConnectionState("online");
      return { ok: true, value: response.removedCount };
    } catch (error) {
      if (error instanceof TaskClientError && error.unavailable) {
        setConnectionState("offline");
      }
      return { ok: false, message: errorMessage(error) };
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    tasks,
    connectionState,
    isMutating,
    isSynchronizing: isMutating || isRefreshing,
    canMutate: connectionState === "online" && !isMutating && !isRefreshing,
    refresh,
    createTask,
    updateTask,
    removeTask,
    clearCompletedTasks,
  } as const;
}
