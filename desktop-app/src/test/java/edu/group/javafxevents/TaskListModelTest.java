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

    assertTrue(model.setCompleted(task.id(), true));
    assertTrue(task.completed());
    assertEquals(1, model.completedCount());
    assertFalse(model.setCompleted(999, true));
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
}
