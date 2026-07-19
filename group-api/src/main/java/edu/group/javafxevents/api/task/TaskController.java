package edu.group.javafxevents.api.task;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

  private final TaskUseCase useCase;

  public TaskController(TaskUseCase useCase) {
    this.useCase = useCase;
  }

  @GetMapping
  public List<TaskResponse> findAll() {
    return useCase.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TaskResponse create(@Valid @RequestBody CreateTaskRequest request) {
    return useCase.create(request);
  }

  @PatchMapping("/{taskId}")
  public TaskResponse update(
      @PathVariable long taskId, @Valid @RequestBody UpdateTaskRequest request) {
    return useCase.update(taskId, request);
  }

  @DeleteMapping("/{taskId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long taskId) {
    useCase.delete(taskId);
  }

  @DeleteMapping("/completed")
  public ClearCompletedResponse clearCompleted() {
    return useCase.clearCompleted();
  }
}
