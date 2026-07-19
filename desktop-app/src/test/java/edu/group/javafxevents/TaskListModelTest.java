package edu.group.javafxevents;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class TaskListModelTest {
  private final TaskListModel model = new TaskListModel();

  @Test
  void addsTrimmedTasksInInsertionOrder() {
    TaskItem first = model.addTask("  Design the layout  ");
    TaskItem second = model.addTask("Connect event handlers");

    assertEquals("Design the layout", first.title());
    assertEquals(2, model.tasks().size());
    assertEquals(second, model.tasks().get(1));
  }

  @Test
  void storesSelectedPriorityForAdvancedTasks() {
    TaskItem task = model.addTask("Prepare the recording", TaskPriority.HIGH);

    assertEquals(TaskPriority.HIGH, task.priority());
    assertThrows(IllegalArgumentException.class, () -> model.addTask("Invalid", null));
  }

  @Test
  void rejectsBlankLongAndDuplicateTitles() {
    model.addTask("Record the demo");

    assertThrows(IllegalArgumentException.class, () -> model.addTask("   "));
    assertThrows(
        IllegalArgumentException.class,
        () -> model.addTask("a".repeat(TaskListModel.MAX_TASK_LENGTH + 1)));
    assertThrows(IllegalArgumentException.class, () -> model.addTask("record the DEMO"));
  }

  @Test
  void marksTasksCompletedAndUpdatesTheCount() {
    TaskItem task = model.addTask("Test checkbox handling");

    assertEquals(TaskStatus.ACTIVE, task.status());
    assertTrue(model.setCompleted(task.id(), true));
    assertTrue(task.completed());
    assertEquals(TaskStatus.COMPLETED, task.status());
    assertEquals(1, model.completedCount());
    assertFalse(model.setCompleted(999, true));
  }

  @Test
  void movesTasksThroughTheReviewWorkflow() {
    TaskItem task = model.addTask("Request a teammate review");

    assertTrue(model.setStatus(task.id(), TaskStatus.IN_REVIEW));
    assertEquals(TaskStatus.IN_REVIEW, task.status());
    assertFalse(task.completed());
    assertEquals(0, model.activeCount());
    assertEquals(1, model.reviewCount());

    assertTrue(model.setStatus(task.id(), TaskStatus.COMPLETED));
    assertEquals(1, model.completedCount());
    assertFalse(model.setStatus(999, TaskStatus.ACTIVE));
    assertThrows(IllegalArgumentException.class, () -> model.setStatus(task.id(), null));
  }

  @Test
  void changesPriorityForAnExistingTask() {
    TaskItem task = model.addTask("Review the final recording", TaskPriority.LOW);

    assertTrue(model.setPriority(task.id(), TaskPriority.HIGH));
    assertEquals(TaskPriority.HIGH, task.priority());
    assertFalse(model.setPriority(999, TaskPriority.MEDIUM));
    assertThrows(IllegalArgumentException.class, () -> model.setPriority(task.id(), null));
  }

  @Test
  void removesOnlyTheRequestedTask() {
    TaskItem first = model.addTask("First");
    TaskItem second = model.addTask("Second");

    assertTrue(model.removeTask(first.id()));
    assertEquals(1, model.tasks().size());
    assertEquals(second, model.tasks().getFirst());
    assertFalse(model.removeTask(999));
  }

  @Test
  void returnsAnImmutableTaskSnapshot() {
    model.addTask("Protected task");

    assertThrows(UnsupportedOperationException.class, () -> model.tasks().clear());
  }

  @Test
  void clearsOnlyCompletedTasks() {
    TaskItem completed = model.addTask("Completed");
    TaskItem active = model.addTask("Active");
    model.setCompleted(completed.id(), true);

    assertEquals(1, model.clearCompleted());
    assertEquals(1, model.tasks().size());
    assertEquals(active, model.tasks().getFirst());
    assertEquals(0, model.clearCompleted());
  }
}
