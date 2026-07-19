package edu.group.javafxevents;

/** Workflow states available for tasks in the advanced view. */
public enum TaskStatus {
  ACTIVE("Active"),
  IN_REVIEW("In Review"),
  COMPLETED("Completed");

  private final String displayName;

  TaskStatus(String displayName) {
    this.displayName = displayName;
  }

  public String displayName() {
    return displayName;
  }
}
