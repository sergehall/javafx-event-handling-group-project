package edu.group.javafxevents.api.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.Locale;

@Entity
@Table(name = "tasks")
class TaskEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 80)
  private String title;

  @Column(name = "normalized_title", nullable = false, unique = true, length = 80)
  private String normalizedTitle;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private TaskPriority priority;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TaskStatus status;

  @Version
  @Column(nullable = false)
  private long version;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected TaskEntity() {}

  private TaskEntity(String title, TaskPriority priority, Instant now) {
    this.title = title.trim();
    this.normalizedTitle = normalize(title);
    this.priority = priority;
    this.status = TaskStatus.ACTIVE;
    this.createdAt = now;
    this.updatedAt = now;
  }

  static TaskEntity from(CreateTaskRequest request, Instant now) {
    return new TaskEntity(request.title(), request.priority(), now);
  }

  void apply(UpdateTaskRequest request, Instant now) {
    if (request.priority() != null) {
      priority = request.priority();
    }
    if (request.status() != null) {
      status = request.status();
    }
    updatedAt = now;
  }

  static String normalize(String title) {
    return title.trim().toLowerCase(Locale.ROOT);
  }

  Long getId() {
    return id;
  }

  String getTitle() {
    return title;
  }

  TaskPriority getPriority() {
    return priority;
  }

  TaskStatus getStatus() {
    return status;
  }

  Instant getCreatedAt() {
    return createdAt;
  }

  Instant getUpdatedAt() {
    return updatedAt;
  }
}
