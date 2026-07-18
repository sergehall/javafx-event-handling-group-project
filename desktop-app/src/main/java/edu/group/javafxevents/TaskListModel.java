package edu.group.javafxevents;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Owns task data and validation independently from JavaFX controls. */
public final class TaskListModel {
  public static final int MAX_TASK_LENGTH = 80;

  private final List<TaskItem> tasks = new ArrayList<>();
  private long nextTaskId = 1;

  /** Validates, normalizes, and appends a task to the list. */
  public TaskItem addTask(String rawTitle) {
    String title = rawTitle == null ? "" : rawTitle.trim();
    if (title.isEmpty()) {
      throw new IllegalArgumentException("Enter a task before adding it.");
    }
    if (title.length() > MAX_TASK_LENGTH) {
      throw new IllegalArgumentException(
          "Keep the task within " + MAX_TASK_LENGTH + " characters.");
    }

    String normalizedTitle = title.toLowerCase(Locale.ROOT);
    boolean duplicate =
        tasks.stream()
            .map(TaskItem::title)
            .map(existingTitle -> existingTitle.toLowerCase(Locale.ROOT))
            .anyMatch(normalizedTitle::equals);
    if (duplicate) {
      throw new IllegalArgumentException("That task is already on the list.");
    }

    TaskItem task = new TaskItem(nextTaskId++, title);
    tasks.add(task);
    return task;
  }

  /** Removes the task with the supplied stable identifier. */
  public boolean removeTask(long taskId) {
    return tasks.removeIf(task -> task.id() == taskId);
  }

  /** Updates completion state without exposing the mutable backing list. */
  public boolean setCompleted(long taskId, boolean completed) {
    return tasks.stream()
        .filter(task -> task.id() == taskId)
        .findFirst()
        .map(
            task -> {
              task.setCompleted(completed);
              return true;
            })
        .orElse(false);
  }

  public long completedCount() {
    return tasks.stream().filter(TaskItem::completed).count();
  }

  /** Returns an immutable snapshot for presentation and tests. */
  public List<TaskItem> tasks() {
    return List.copyOf(tasks);
  }
}
