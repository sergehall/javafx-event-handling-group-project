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
    return addTask(rawTitle, TaskPriority.MEDIUM);
  }

  /** Adds a validated task with the priority selected in the advanced workflow. */
  public TaskItem addTask(String rawTitle, TaskPriority priority) {
    String title = validateNewTask(rawTitle, priority);
    TaskItem task = new TaskItem(nextTaskId++, title, priority);
    tasks.add(task);
    return task;
  }

  /** Validates a prospective task without mutating the current list. */
  public String validateNewTask(String rawTitle, TaskPriority priority) {
    if (priority == null) {
      throw new IllegalArgumentException("Choose a task priority.");
    }

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
    return title;
  }

  /** Replaces the current snapshot with tasks loaded from persistent storage. */
  public void replaceTasks(List<TaskItem> persistedTasks) {
    if (persistedTasks == null) {
      throw new IllegalArgumentException("Persisted tasks are required.");
    }
    tasks.clear();
    tasks.addAll(persistedTasks);
    nextTaskId = tasks.stream().mapToLong(TaskItem::id).max().orElse(0) + 1;
  }

  /** Adds a task whose stable identifier was assigned by persistent storage. */
  public void addPersistedTask(TaskItem task) {
    if (task == null) {
      throw new IllegalArgumentException("Persisted task is required.");
    }
    validateNewTask(task.title(), task.priority());
    tasks.add(task);
    nextTaskId = Math.max(nextTaskId, task.id() + 1);
  }

  /** Replaces one task with the latest representation returned by persistent storage. */
  public boolean replaceTask(TaskItem replacement) {
    if (replacement == null) {
      throw new IllegalArgumentException("Updated task is required.");
    }
    for (int index = 0; index < tasks.size(); index++) {
      if (tasks.get(index).id() == replacement.id()) {
        tasks.set(index, replacement);
        return true;
      }
    }
    return false;
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

  /** Updates the priority selected for an existing task. */
  public boolean setPriority(long taskId, TaskPriority priority) {
    if (priority == null) {
      throw new IllegalArgumentException("Choose a task priority.");
    }

    return tasks.stream()
        .filter(task -> task.id() == taskId)
        .findFirst()
        .map(
            task -> {
              task.setPriority(priority);
              return true;
            })
        .orElse(false);
  }

  /** Moves a task through the advanced Active, In Review, and Completed workflow. */
  public boolean setStatus(long taskId, TaskStatus status) {
    if (status == null) {
      throw new IllegalArgumentException("Choose a task status.");
    }

    return tasks.stream()
        .filter(task -> task.id() == taskId)
        .findFirst()
        .map(
            task -> {
              task.setStatus(status);
              return true;
            })
        .orElse(false);
  }

  public long activeCount() {
    return tasks.stream().filter(task -> task.status() == TaskStatus.ACTIVE).count();
  }

  public long reviewCount() {
    return tasks.stream().filter(task -> task.status() == TaskStatus.IN_REVIEW).count();
  }

  public long completedCount() {
    return tasks.stream().filter(TaskItem::completed).count();
  }

  /** Removes every completed task and returns the number of removed items. */
  public int clearCompleted() {
    int previousSize = tasks.size();
    tasks.removeIf(TaskItem::completed);
    return previousSize - tasks.size();
  }

  /** Returns an immutable snapshot for presentation and tests. */
  public List<TaskItem> tasks() {
    return List.copyOf(tasks);
  }
}
