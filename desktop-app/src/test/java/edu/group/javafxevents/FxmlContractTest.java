package edu.group.javafxevents;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class FxmlContractTest {
  @Test
  void declaresExpectedControllerFieldsAndHandlers() throws IOException, URISyntaxException {
    var resource = EventHandlingApp.class.getResource("event-handling-view.fxml");
    assertNotNull(resource);
    String fxml = Files.readString(Path.of(resource.toURI()));

    for (String expected :
        new String[] {
          "EventHandlingController",
          "<BorderPane",
          "<VBox",
          "fx:id=\"taskField\"",
          "fx:id=\"addTaskButton\"",
          "fx:id=\"taskListView\"",
          "fx:id=\"summaryLabel\"",
          "fx:id=\"foundationModeButton\"",
          "fx:id=\"advancedModeButton\"",
          "fx:id=\"priorityBox\"",
          "fx:id=\"progressBar\"",
          "fx:id=\"reviewCountLabel\"",
          "fx:id=\"reviewFilterButton\"",
          "fx:id=\"priorityFilterBox\"",
          "styleClass=\"filter-priority-box\"",
          "styleClass=\"progress-label\"",
          "#handleAddTask",
          "#showFoundation",
          "#showAdvanced",
          "#handleFilterTasks",
          "#handlePriorityFilter",
          "#handleClearCompleted",
          "text=\"Required task workflow\"",
          "text=\"Complete task workflow\"",
          "text=\"Add Task\""
        }) {
      assertTrue(fxml.contains(expected), () -> "Missing FXML contract value: " + expected);
    }
  }

  @Test
  void scopesTaskRowStylesWithoutHidingTheSelectedPriority()
      throws IOException, URISyntaxException {
    var resource = EventHandlingApp.class.getResource("event-handling.css");
    assertNotNull(resource);
    String stylesheet = Files.readString(Path.of(resource.toURI()));

    assertTrue(stylesheet.contains(".task-list .list-cell {"));
    assertTrue(stylesheet.contains(".task-list .list-cell:empty {"));
    assertTrue(stylesheet.contains(".combo-box-popup .list-cell:filled:selected"));
    assertTrue(stylesheet.contains("-fx-background-color: #2d715f;"));
    assertTrue(stylesheet.contains("-fx-pref-height: 14px;"));
    assertTrue(stylesheet.contains(".task-status-box {"));
    assertTrue(stylesheet.contains(".status-review {"));
    assertFalse(stylesheet.contains("\n.list-cell {"));

    int focusedControlsStart = stylesheet.indexOf(".text-field:focused");
    int focusedControlsEnd = stylesheet.indexOf('}', focusedControlsStart);
    String focusedControlsRule = stylesheet.substring(focusedControlsStart, focusedControlsEnd);
    assertFalse(focusedControlsRule.contains("-fx-border-width"));
  }
}
