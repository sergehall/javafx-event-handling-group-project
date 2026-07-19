package edu.group.javafxevents.api.task;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService implements TaskUseCase {

  private final TaskRepository repository;
  private final Clock clock = Clock.systemUTC();

  public TaskService(TaskRepository repository) {
    this.repository = repository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<TaskResponse> findAll() {
    return repository.findAllByOrderByIdAsc().stream().map(TaskResponse::from).toList();
  }

  @Override
  @Transactional
  public TaskResponse create(CreateTaskRequest request) {
    if (repository.existsByNormalizedTitle(TaskEntity.normalize(request.title()))) {
      throw new DuplicateTaskException();
    }

    try {
      TaskEntity task = TaskEntity.from(request, Instant.now(clock));
      return TaskResponse.from(repository.saveAndFlush(task));
    } catch (DataIntegrityViolationException exception) {
      throw new DuplicateTaskException();
    }
  }

  @Override
  @Transactional
  public TaskResponse update(long taskId, UpdateTaskRequest request) {
    TaskEntity task =
        repository.findById(taskId).orElseThrow(() -> new TaskNotFoundException(taskId));
    task.apply(request, Instant.now(clock));
    return TaskResponse.from(task);
  }

  @Override
  @Transactional
  public void delete(long taskId) {
    TaskEntity task =
        repository.findById(taskId).orElseThrow(() -> new TaskNotFoundException(taskId));
    repository.delete(task);
  }

  @Override
  @Transactional
  public ClearCompletedResponse clearCompleted() {
    return new ClearCompletedResponse(repository.deleteByStatus(TaskStatus.COMPLETED));
  }
}
