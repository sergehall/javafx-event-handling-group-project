package edu.group.javafxevents;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.css.PseudoClass;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.text.Text;

/** Connects the JavaFX controls to the task model and keeps the visible list synchronized. */
public final class EventHandlingController {
  private final TaskListModel model = new TaskListModel();
  private final ObservableList<TaskItem> visibleTasks = FXCollections.observableArrayList();

  @FXML private TextField taskField;

  @FXML private ListView<TaskItem> taskListView;

  @FXML private Label statusLabel;

  @FXML private Label summaryLabel;

  /** Configures the custom task rows after FXMLLoader injects all declared controls. */
  @FXML
  private void initialize() {
    taskListView.setItems(visibleTasks);
    taskListView.setCellFactory(ignored -> new TaskCell());
    refreshView();
  }

  /** Adds a validated task when the user presses Enter or activates the Add Task button. */
  @FXML
  private void handleAddTask(ActionEvent event) {
    try {
      TaskItem addedTask = model.addTask(taskField.getText());
      taskField.clear();
      statusLabel.setText("Added: " + addedTask.title());
      refreshView();
    } catch (IllegalArgumentException exception) {
      statusLabel.setText(exception.getMessage());
    }

    taskField.requestFocus();
    event.consume();
  }

  /** Copies the model snapshot into the observable list and updates completion totals. */
  private void refreshView() {
    visibleTasks.setAll(model.tasks());
    updateSummary();
  }

  private void updateSummary() {
    int total = model.tasks().size();
    long completed = model.completedCount();
    summaryLabel.setText("%d of %d tasks completed".formatted(completed, total));

    if (total == 0) {
      statusLabel.setText("Add your first task to begin.");
    }
  }

  /**
   * Renders the checkbox, title, and Remove button required for every task in the ListView. Actions
   * resolve the current cell item so reused cells never update the wrong task.
   */
  private final class TaskCell extends ListCell<TaskItem> {
    private static final PseudoClass COMPLETED = PseudoClass.getPseudoClass("completed");

    private final CheckBox completedCheckBox = new CheckBox();
    private final Text taskTitle = new Text();
    private final Region spacer = new Region();
    private final Button removeButton = new Button("Remove");
    private final HBox row = new HBox(12, completedCheckBox, taskTitle, spacer, removeButton);

    private TaskCell() {
      row.setAlignment(Pos.CENTER_LEFT);
      row.getStyleClass().add("task-row");
      taskTitle.getStyleClass().add("task-title");
      removeButton.getStyleClass().add("remove-button");
      HBox.setHgrow(spacer, Priority.ALWAYS);

      completedCheckBox.setOnAction(
          event -> {
            TaskItem task = getItem();
            if (task != null) {
              model.setCompleted(task.id(), completedCheckBox.isSelected());
              applyCompletionStyle(task);
              updateSummary();
            }
            event.consume();
          });

      removeButton.setOnAction(
          event -> {
            TaskItem task = getItem();
            if (task != null && model.removeTask(task.id())) {
              statusLabel.setText("Removed: " + task.title());
              refreshView();
            }
            event.consume();
          });
    }

    @Override
    protected void updateItem(TaskItem task, boolean empty) {
      super.updateItem(task, empty);
      setText(null);

      if (empty || task == null) {
        setGraphic(null);
        return;
      }

      taskTitle.setText(task.title());
      completedCheckBox.setSelected(task.completed());
      completedCheckBox.setAccessibleText("Mark " + task.title() + " as completed");
      removeButton.setAccessibleText("Remove " + task.title());
      applyCompletionStyle(task);
      setGraphic(row);
    }

    private void applyCompletionStyle(TaskItem task) {
      row.pseudoClassStateChanged(COMPLETED, task.completed());
      taskTitle.setStrikethrough(task.completed());
    }
  }
}
