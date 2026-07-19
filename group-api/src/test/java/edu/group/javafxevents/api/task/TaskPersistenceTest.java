package edu.group.javafxevents.api.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TaskPersistenceTest {

  @Autowired private TaskUseCase useCase;
  @Autowired private TaskRepository repository;

  @Test
  void persistsAndUpdatesTaskThroughFlywayManagedSchema() {
    TaskResponse created = useCase.create(new CreateTaskRequest("  Record DB demo  ", null));

    assertThat(created.id()).isPositive();
    assertThat(created.title()).isEqualTo("Record DB demo");
    assertThat(created.priority()).isEqualTo(TaskPriority.MEDIUM);
    assertThat(created.status()).isEqualTo(TaskStatus.ACTIVE);

    TaskResponse updated =
        useCase.update(
            created.id(), new UpdateTaskRequest(TaskPriority.HIGH, TaskStatus.IN_REVIEW));

    assertThat(updated.priority()).isEqualTo(TaskPriority.HIGH);
    assertThat(updated.status()).isEqualTo(TaskStatus.IN_REVIEW);
    assertThat(useCase.findAll()).extracting(TaskResponse::id).contains(created.id());
  }

  @Test
  void rejectsCaseInsensitiveDuplicateTitles() {
    useCase.create(new CreateTaskRequest("Prepare submission", TaskPriority.LOW));

    assertThatThrownBy(
            () -> useCase.create(new CreateTaskRequest("prepare SUBMISSION", TaskPriority.HIGH)))
        .isInstanceOf(DuplicateTaskException.class)
        .hasMessage("That task is already on the list.");
  }

  @Test
  void clearsOnlyCompletedTasks() {
    TaskResponse completed =
        useCase.create(new CreateTaskRequest("Completed database task", TaskPriority.MEDIUM));
    useCase.update(completed.id(), new UpdateTaskRequest(null, TaskStatus.COMPLETED));
    TaskResponse active =
        useCase.create(new CreateTaskRequest("Active database task", TaskPriority.MEDIUM));

    ClearCompletedResponse result = useCase.clearCompleted();

    assertThat(result.removedCount()).isEqualTo(1);
    assertThat(repository.findById(completed.id())).isEmpty();
    assertThat(repository.findById(active.id())).isPresent();
  }
}
