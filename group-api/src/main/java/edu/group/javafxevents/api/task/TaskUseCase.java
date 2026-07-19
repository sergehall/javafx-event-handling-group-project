package edu.group.javafxevents.api.task;

import java.util.List;

public interface TaskUseCase {

  List<TaskResponse> findAll();

  TaskResponse create(CreateTaskRequest request);

  TaskResponse update(long taskId, UpdateTaskRequest request);

  void delete(long taskId);

  ClearCompletedResponse clearCompleted();
}
