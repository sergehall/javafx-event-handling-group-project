package edu.group.javafxevents.api.task;

import java.time.Instant;

public record TaskResponse(
    long id,
    String title,
    TaskPriority priority,
    TaskStatus status,
    Instant createdAt,
    Instant updatedAt) {

  static TaskResponse from(TaskEntity entity) {
    return new TaskResponse(
        entity.getId(),
        entity.getTitle(),
        entity.getPriority(),
        entity.getStatus(),
        entity.getCreatedAt(),
        entity.getUpdatedAt());
  }
}
