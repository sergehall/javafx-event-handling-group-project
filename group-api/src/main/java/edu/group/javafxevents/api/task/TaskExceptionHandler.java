package edu.group.javafxevents.api.task;

import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = TaskController.class)
class TaskExceptionHandler {

  @ExceptionHandler(TaskNotFoundException.class)
  ProblemDetail handleNotFound(TaskNotFoundException exception) {
    return problem(HttpStatus.NOT_FOUND, "Task not found", exception.getMessage());
  }

  @ExceptionHandler(DuplicateTaskException.class)
  ProblemDetail handleConflict(DuplicateTaskException exception) {
    return problem(HttpStatus.CONFLICT, "Duplicate task", exception.getMessage());
  }

  private ProblemDetail problem(HttpStatus status, String title, String detail) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setTitle(title);
    problem.setType(URI.create("https://example.local/problems/task-" + status.value()));
    return problem;
  }
}
