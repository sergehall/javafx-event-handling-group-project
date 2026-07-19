package edu.group.javafxevents.api.task;

final class TaskNotFoundException extends RuntimeException {

  TaskNotFoundException(long taskId) {
    super("Task " + taskId + " was not found.");
  }
}
