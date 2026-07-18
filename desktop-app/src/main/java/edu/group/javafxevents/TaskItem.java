package edu.group.javafxevents;

/** A single task displayed by the JavaFX ListView. */
public final class TaskItem {
  private final long id;
  private final String title;
  private boolean completed;

  TaskItem(long id, String title) {
    this.id = id;
    this.title = title;
  }

  public long id() {
    return id;
  }

  public String title() {
    return title;
  }

  public boolean completed() {
    return completed;
  }

  void setCompleted(boolean completed) {
    this.completed = completed;
  }
}
