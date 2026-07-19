package edu.group.javafxevents.api.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
    @NotBlank @Size(max = 80) String title, @NotNull TaskPriority priority) {

  public CreateTaskRequest {
    priority = priority == null ? TaskPriority.MEDIUM : priority;
  }
}
