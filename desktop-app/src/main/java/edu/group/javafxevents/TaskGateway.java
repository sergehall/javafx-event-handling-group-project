package edu.group.javafxevents;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/** Persistence boundary used by the JavaFX controller without exposing database details. */
interface TaskGateway {

  CompletableFuture<List<TaskItem>> findAll();

  CompletableFuture<TaskItem> create(String title, TaskPriority priority);

  CompletableFuture<TaskItem> updateStatus(long taskId, TaskStatus status);

  CompletableFuture<TaskItem> updatePriority(long taskId, TaskPriority priority);

  CompletableFuture<Void> delete(long taskId);

  CompletableFuture<Integer> clearCompleted();
}
