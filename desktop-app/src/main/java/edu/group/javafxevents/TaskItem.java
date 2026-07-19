package edu.group.javafxevents;

/** A single task displayed by the JavaFX ListView. */
public final class TaskItem {
  private final long id;
  private final String title;
  private TaskPriority priority;
  private TaskStatus status = TaskStatus.ACTIVE;

  TaskItem(long id, String title, TaskPriority priority) {
    this.id = id;
    this.title = title;
    this.priority = priority;
  }

  public long id() {
    return id;
  }

  public String title() {
    return title;
  }

  public TaskPriority priority() {
    return priority;
  }

  public boolean completed() {
    return status == TaskStatus.COMPLETED;
  }

  public TaskStatus status() {
    return status;
  }

  void setCompleted(boolean completed) {
    status = completed ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;
  }

  void setPriority(TaskPriority priority) {
    this.priority = priority;
  }

  void setStatus(TaskStatus status) {
    this.status = status;
  }
}
