package edu.group.javafxevents.api.task;

final class DuplicateTaskException extends RuntimeException {

  DuplicateTaskException() {
    super("That task is already on the list.");
  }
}
