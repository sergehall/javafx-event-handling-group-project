package edu.group.javafxevents.api.task;

import jakarta.validation.constraints.AssertTrue;

public record UpdateTaskRequest(TaskPriority priority, TaskStatus status) {

  @AssertTrue(message = "Choose a priority or status to update.")
  public boolean hasChange() {
    return priority != null || status != null;
  }
}
