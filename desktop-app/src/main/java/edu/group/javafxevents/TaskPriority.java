package edu.group.javafxevents;

/** Priority options available in the advanced task workflow. */
public enum TaskPriority {
  HIGH("High"),
  MEDIUM("Medium"),
  LOW("Low");

  private final String displayName;

  TaskPriority(String displayName) {
    this.displayName = displayName;
  }

  public String displayName() {
    return displayName;
  }
}
