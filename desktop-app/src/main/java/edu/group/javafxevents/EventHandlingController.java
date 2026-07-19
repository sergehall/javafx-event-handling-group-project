package edu.group.javafxevents;

import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.function.Consumer;
import java.util.function.Predicate;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.css.PseudoClass;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.ProgressBar;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.text.Text;

/** Connects the JavaFX controls to the task model and switches between both lab paths. */
public final class EventHandlingController {
  private final TaskListModel model = new TaskListModel();
  private final ObservableList<TaskItem> visibleTasks = FXCollections.observableArrayList();
  private final TaskGateway taskGateway;

  private ViewMode viewMode = ViewMode.FOUNDATION;
  private TaskFilter taskFilter = TaskFilter.ALL;
  private PriorityFilter priorityFilter = PriorityFilter.ALL;
  private StorageMode storageMode = StorageMode.CONNECTING;

  @FXML private ToggleButton foundationModeButton;
  @FXML private ToggleButton advancedModeButton;
  @FXML private HBox storageStatusBadge;
  @FXML private Label storageStatusLabel;
  @FXML private Label storageStatusDetailLabel;
  @FXML private Label eyebrowLabel;
  @FXML private Label titleLabel;
  @FXML private Label subtitleLabel;
  @FXML private TextField taskField;
  @FXML private Button addTaskButton;
  @FXML private ComboBox<TaskPriority> priorityBox;
  @FXML private HBox priorityField;
  @FXML private ListView<TaskItem> taskListView;
  @FXML private HBox advancedStats;
  @FXML private HBox advancedToolbar;
  @FXML private ToggleButton allFilterButton;
  @FXML private ToggleButton activeFilterButton;
  @FXML private ToggleButton reviewFilterButton;
  @FXML private ToggleButton completedFilterButton;
  @FXML private ComboBox<PriorityFilter> priorityFilterBox;
  @FXML private Button clearCompletedButton;
  @FXML private ProgressBar progressBar;
  @FXML private Label progressLabel;
  @FXML private Label totalCountLabel;
  @FXML private Label activeCountLabel;
  @FXML private Label reviewCountLabel;
  @FXML private Label completedCountLabel;
  @FXML private Label statusLabel;
  @FXML private Label summaryLabel;

  public EventHandlingController() {
    this(new HttpTaskGateway());
  }

  EventHandlingController(TaskGateway taskGateway) {
    this.taskGateway = Objects.requireNonNull(taskGateway);
  }

  /** Configures task rows, path controls, and advanced options after FXML injection. */
  @FXML
  private void initialize() {
    ToggleGroup modeGroup = new ToggleGroup();
    foundationModeButton.setToggleGroup(modeGroup);
    advancedModeButton.setToggleGroup(modeGroup);

    ToggleGroup filterGroup = new ToggleGroup();
    allFilterButton.setToggleGroup(filterGroup);
    activeFilterButton.setToggleGroup(filterGroup);
    reviewFilterButton.setToggleGroup(filterGroup);
    completedFilterButton.setToggleGroup(filterGroup);

    priorityBox.setItems(FXCollections.observableArrayList(TaskPriority.values()));
    priorityBox.setValue(TaskPriority.MEDIUM);
    priorityBox.setCellFactory(ignored -> new PriorityCell());
    priorityBox.setButtonCell(new PriorityCell());

    priorityFilterBox.setItems(FXCollections.observableArrayList(PriorityFilter.values()));
    priorityFilterBox.setValue(PriorityFilter.ALL);
    priorityFilterBox.setCellFactory(ignored -> new PriorityFilterCell());
    priorityFilterBox.setButtonCell(new PriorityFilterCell());

    taskListView.setItems(visibleTasks);
    taskListView.setCellFactory(ignored -> new TaskCell());
    applyMode(ViewMode.FOUNDATION);
    setTaskComposerDisabled(true);
    updateStorageIndicator(StorageHealth.CONNECTING, "Task API");
    statusLabel.setText("Connecting to task storage...");
    loadPersistedTasks();
  }

  @FXML
  private void showFoundation() {
    applyMode(ViewMode.FOUNDATION);
  }

  @FXML
  private void showAdvanced() {
    applyMode(ViewMode.ADVANCED);
  }

  /** Adds a validated task when the user presses Enter or activates the Add Task button. */
  @FXML
  private void handleAddTask(ActionEvent event) {
    try {
      TaskPriority priority =
          viewMode == ViewMode.ADVANCED ? priorityBox.getValue() : TaskPriority.MEDIUM;
      String title = model.validateNewTask(taskField.getText(), priority);
      if (storageMode == StorageMode.MEMORY) {
        TaskItem addedTask = model.addTask(title, priority);
        taskField.clear();
        statusLabel.setText("Added in memory: " + addedTask.title());
        refreshView();
      } else if (storageMode == StorageMode.DATABASE) {
        setTaskComposerDisabled(true);
        statusLabel.setText("Saving task to PostgreSQL...");
        completeOnFxThread(
            taskGateway.create(title, priority),
            addedTask -> {
              model.addPersistedTask(addedTask);
              if (taskField.getText().trim().equals(title)) {
                taskField.clear();
              }
              setTaskComposerDisabled(false);
              updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
              statusLabel.setText("Saved to PostgreSQL: " + addedTask.title());
              refreshView();
              taskField.requestFocus();
            },
            failure -> {
              setTaskComposerDisabled(false);
              showPersistenceFailure("Task was not saved", failure);
              taskField.requestFocus();
            });
      }
    } catch (IllegalArgumentException exception) {
      statusLabel.setText(exception.getMessage());
    }

    taskField.requestFocus();
    event.consume();
  }

  @FXML
  private void handleFilterTasks(ActionEvent event) {
    ToggleButton selectedFilterButton = (ToggleButton) event.getSource();
    selectedFilterButton.setSelected(true);

    if (event.getSource() == activeFilterButton) {
      taskFilter = TaskFilter.ACTIVE;
    } else if (event.getSource() == reviewFilterButton) {
      taskFilter = TaskFilter.IN_REVIEW;
    } else if (event.getSource() == completedFilterButton) {
      taskFilter = TaskFilter.COMPLETED;
    } else {
      taskFilter = TaskFilter.ALL;
    }
    refreshView();
    event.consume();
  }

  @FXML
  private void handlePriorityFilter(ActionEvent event) {
    PriorityFilter selectedPriority = priorityFilterBox.getValue();
    priorityFilter = selectedPriority == null ? PriorityFilter.ALL : selectedPriority;
    refreshView();
    event.consume();
  }

  @FXML
  private void handleClearCompleted(ActionEvent event) {
    if (storageMode == StorageMode.MEMORY) {
      int removedCount = model.clearCompleted();
      showClearedMessage(removedCount, "in memory");
      refreshView();
    } else if (storageMode == StorageMode.DATABASE) {
      clearCompletedButton.setDisable(true);
      statusLabel.setText("Removing completed tasks from PostgreSQL...");
      completeOnFxThread(
          taskGateway.clearCompleted(),
          removedCount -> {
            model.clearCompleted();
            updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
            showClearedMessage(removedCount, "from PostgreSQL");
            refreshView();
          },
          failure -> {
            refreshView();
            showPersistenceFailure("Completed tasks were not removed", failure);
          });
    }
    event.consume();
  }

  private void loadPersistedTasks() {
    completeOnFxThread(
        taskGateway.findAll(),
        persistedTasks -> {
          model.replaceTasks(persistedTasks);
          storageMode = StorageMode.DATABASE;
          setTaskComposerDisabled(false);
          updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
          statusLabel.setText(
              persistedTasks.isEmpty()
                  ? "PostgreSQL connected. Add your first task."
                  : "PostgreSQL connected · Loaded " + persistedTasks.size() + " tasks.");
          refreshView();
          taskField.requestFocus();
        },
        failure -> {
          storageMode = StorageMode.MEMORY;
          setTaskComposerDisabled(false);
          updateStorageIndicator(StorageHealth.OFFLINE, "Memory mode");
          statusLabel.setText(
              "API unavailable · Using memory for this session. Start group-api to persist tasks.");
          refreshView();
          taskField.requestFocus();
        });
  }

  private void setTaskComposerDisabled(boolean disabled) {
    taskField.setDisable(disabled);
    priorityBox.setDisable(disabled);
    addTaskButton.setDisable(disabled);
  }

  private <T> void completeOnFxThread(
      CompletableFuture<T> future, Consumer<T> onSuccess, Consumer<Throwable> onFailure) {
    future.whenComplete(
        (result, failure) ->
            Platform.runLater(
                () -> {
                  if (failure == null) {
                    onSuccess.accept(result);
                  } else {
                    onFailure.accept(unwrap(failure));
                  }
                }));
  }

  private Throwable unwrap(Throwable failure) {
    Throwable current = failure;
    while ((current instanceof CompletionException) && current.getCause() != null) {
      current = current.getCause();
    }
    return current;
  }

  private void showPersistenceFailure(String action, Throwable failure) {
    if (failure instanceof TaskApiException apiFailure) {
      updateStorageIndicator(
          apiFailure.isConnectivityFailure() ? StorageHealth.OFFLINE : StorageHealth.ONLINE,
          apiFailure.isConnectivityFailure() ? "Changes not saved" : "PostgreSQL");
    }
    String detail =
        failure instanceof TaskApiException && failure.getMessage() != null
            ? failure.getMessage()
            : "Unexpected task API error.";
    statusLabel.setText(action + ": " + detail);
  }

  private void updateStorageIndicator(StorageHealth health, String detail) {
    storageStatusBadge
        .getStyleClass()
        .removeAll("storage-connecting", "storage-online", "storage-offline");
    storageStatusBadge.getStyleClass().add(health.styleClass());
    storageStatusLabel.setText(health.displayName());
    storageStatusDetailLabel.setText(detail);
    storageStatusBadge.setAccessibleText(health.displayName() + ". " + detail + ".");
  }

  private void showClearedMessage(int removedCount, String storageDescription) {
    String taskWord = removedCount == 1 ? "task" : "tasks";
    statusLabel.setText(
        "Cleared " + removedCount + " completed " + taskWord + " " + storageDescription + ".");
  }

  private void applyMode(ViewMode nextMode) {
    viewMode = nextMode;
    boolean advanced = nextMode == ViewMode.ADVANCED;

    foundationModeButton.setSelected(!advanced);
    advancedModeButton.setSelected(advanced);
    eyebrowLabel.setText(
        advanced ? "GROUP ASSIGNMENT · ADVANCED" : "GROUP ASSIGNMENT · FOUNDATION");
    titleLabel.setText(advanced ? "Advanced Task List" : "JavaFX Task List");
    subtitleLabel.setText(
        advanced
            ? "Prioritize work, move tasks into review, and track delivery progress."
            : "Add tasks, mark work complete, and remove items from one synchronized list.");

    setAdvancedControlVisible(priorityField, advanced);
    setAdvancedControlVisible(advancedStats, advanced);
    setAdvancedControlVisible(advancedToolbar, advanced);
    refreshView();
  }

  private void setAdvancedControlVisible(Node node, boolean visible) {
    node.setManaged(visible);
    node.setVisible(visible);
  }

  /** Copies a filtered model snapshot into the observable list and updates completion totals. */
  private void refreshView() {
    Predicate<TaskItem> visibleInCurrentMode =
        viewMode == ViewMode.FOUNDATION
            ? ignored -> true
            : task -> taskFilter.matches(task) && priorityFilter.matches(task);
    visibleTasks.setAll(model.tasks().stream().filter(visibleInCurrentMode).toList());
    taskListView.refresh();
    updateSummary();
  }

  private void updateSummary() {
    int total = model.tasks().size();
    long completed = model.completedCount();
    long active = model.activeCount();
    long inReview = model.reviewCount();
    double progress = total == 0 ? 0 : (double) completed / total;

    summaryLabel.setText("%d of %d tasks completed".formatted(completed, total));
    totalCountLabel.setText(Integer.toString(total));
    activeCountLabel.setText(Long.toString(active));
    reviewCountLabel.setText(Long.toString(inReview));
    completedCountLabel.setText(Long.toString(completed));
    progressBar.setProgress(progress);
    progressLabel.setText(Math.round(progress * 100) + "% complete");
    clearCompletedButton.setDisable(completed == 0);
  }

  /** Renders each task with the controls required by both paths. */
  private final class TaskCell extends ListCell<TaskItem> {
    private static final PseudoClass COMPLETED = PseudoClass.getPseudoClass("completed");

    private final CheckBox completedCheckBox = new CheckBox();
    private final Text taskTitle = new Text();
    private final ComboBox<TaskPriority> taskPriorityBox =
        new ComboBox<>(FXCollections.observableArrayList(TaskPriority.values()));
    private final ComboBox<TaskStatus> taskStatusBox =
        new ComboBox<>(FXCollections.observableArrayList(TaskStatus.values()));
    private final Region spacer = new Region();
    private final Button removeButton = new Button("Remove");
    private final HBox row =
        new HBox(
            10, completedCheckBox, taskPriorityBox, taskStatusBox, taskTitle, spacer, removeButton);
    private boolean updatingPriority;
    private boolean updatingStatus;

    private TaskCell() {
      getStyleClass().add("task-list-cell");
      row.setAlignment(Pos.CENTER_LEFT);
      row.getStyleClass().add("task-row");
      taskTitle.getStyleClass().add("task-title");
      taskPriorityBox.getStyleClass().add("task-priority-box");
      taskPriorityBox.setPrefWidth(104);
      taskPriorityBox.setCellFactory(ignored -> new PriorityCell());
      taskPriorityBox.setButtonCell(new PriorityCell());
      taskStatusBox.getStyleClass().add("task-status-box");
      taskStatusBox.setPrefWidth(118);
      taskStatusBox.setCellFactory(ignored -> new StatusCell());
      taskStatusBox.setButtonCell(new StatusCell());
      removeButton.getStyleClass().add("remove-button");
      HBox.setHgrow(spacer, Priority.ALWAYS);

      completedCheckBox.setOnAction(this::handleCompletionChange);
      taskStatusBox.setOnAction(this::handleStatusChange);
      taskPriorityBox.setOnAction(this::handlePriorityChange);
      removeButton.setOnAction(this::handleRemove);
    }

    private void handleCompletionChange(ActionEvent event) {
      TaskItem task = getItem();
      if (task != null) {
        TaskStatus nextStatus =
            completedCheckBox.isSelected() ? TaskStatus.COMPLETED : TaskStatus.ACTIVE;
        if (storageMode == StorageMode.MEMORY) {
          model.setStatus(task.id(), nextStatus);
          statusLabel.setText("Status changed in memory: " + task.title());
          refreshView();
        } else if (storageMode == StorageMode.DATABASE) {
          row.setDisable(true);
          completeOnFxThread(
              taskGateway.updateStatus(task.id(), nextStatus),
              updatedTask -> {
                model.replaceTask(updatedTask);
                updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
                statusLabel.setText("Status saved to PostgreSQL: " + task.title());
                refreshView();
              },
              failure -> {
                row.setDisable(false);
                refreshView();
                showPersistenceFailure("Status was not saved", failure);
              });
        }
      }
      event.consume();
    }

    private void handleStatusChange(ActionEvent event) {
      TaskItem task = getItem();
      TaskStatus selectedStatus = taskStatusBox.getValue();
      if (!updatingStatus && task != null && selectedStatus != null) {
        if (storageMode == StorageMode.MEMORY && model.setStatus(task.id(), selectedStatus)) {
          statusLabel.setText(
              "Status changed in memory: " + task.title() + " · " + selectedStatus.displayName());
          refreshView();
        } else if (storageMode == StorageMode.DATABASE) {
          row.setDisable(true);
          completeOnFxThread(
              taskGateway.updateStatus(task.id(), selectedStatus),
              updatedTask -> {
                model.replaceTask(updatedTask);
                updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
                statusLabel.setText(
                    "Status saved to PostgreSQL: "
                        + task.title()
                        + " · "
                        + selectedStatus.displayName());
                refreshView();
              },
              failure -> {
                row.setDisable(false);
                refreshView();
                showPersistenceFailure("Status was not saved", failure);
              });
        }
      }
      event.consume();
    }

    private void handlePriorityChange(ActionEvent event) {
      TaskItem task = getItem();
      TaskPriority selectedPriority = taskPriorityBox.getValue();
      if (!updatingPriority && task != null && selectedPriority != null) {
        if (storageMode == StorageMode.MEMORY && model.setPriority(task.id(), selectedPriority)) {
          statusLabel.setText(
              "Priority changed in memory: "
                  + task.title()
                  + " · "
                  + selectedPriority.displayName());
          refreshView();
        } else if (storageMode == StorageMode.DATABASE) {
          row.setDisable(true);
          completeOnFxThread(
              taskGateway.updatePriority(task.id(), selectedPriority),
              updatedTask -> {
                model.replaceTask(updatedTask);
                updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
                statusLabel.setText(
                    "Priority saved to PostgreSQL: "
                        + task.title()
                        + " · "
                        + selectedPriority.displayName());
                refreshView();
              },
              failure -> {
                row.setDisable(false);
                refreshView();
                showPersistenceFailure("Priority was not saved", failure);
              });
        }
      }
      event.consume();
    }

    private void handleRemove(ActionEvent event) {
      TaskItem task = getItem();
      if (task != null) {
        if (storageMode == StorageMode.MEMORY && model.removeTask(task.id())) {
          statusLabel.setText("Removed in memory: " + task.title());
          refreshView();
        } else if (storageMode == StorageMode.DATABASE) {
          row.setDisable(true);
          completeOnFxThread(
              taskGateway.delete(task.id()),
              ignored -> {
                model.removeTask(task.id());
                updateStorageIndicator(StorageHealth.ONLINE, "PostgreSQL");
                statusLabel.setText("Removed from PostgreSQL: " + task.title());
                refreshView();
              },
              failure -> {
                row.setDisable(false);
                showPersistenceFailure("Task was not removed", failure);
              });
        }
      }
      event.consume();
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
      boolean connecting = storageMode == StorageMode.CONNECTING;
      row.setDisable(connecting);
      completedCheckBox.setDisable(connecting);
      taskPriorityBox.setDisable(connecting);
      taskStatusBox.setDisable(connecting);
      removeButton.setDisable(connecting);
      completedCheckBox.setSelected(task.completed());
      completedCheckBox.setAccessibleText("Mark " + task.title() + " as completed");
      removeButton.setAccessibleText("Remove " + task.title());
      updatingPriority = true;
      taskPriorityBox.setValue(task.priority());
      updatingPriority = false;
      taskPriorityBox.setAccessibleText("Change priority for " + task.title());
      taskPriorityBox.getStyleClass().removeAll("priority-high", "priority-medium", "priority-low");
      taskPriorityBox.getStyleClass().add("priority-" + task.priority().name().toLowerCase());
      taskPriorityBox.setManaged(viewMode == ViewMode.ADVANCED);
      taskPriorityBox.setVisible(viewMode == ViewMode.ADVANCED);
      updatingStatus = true;
      taskStatusBox.setValue(task.status());
      updatingStatus = false;
      taskStatusBox.setAccessibleText("Change status for " + task.title());
      taskStatusBox.getStyleClass().removeAll("status-active", "status-review", "status-completed");
      taskStatusBox.getStyleClass().add(statusStyleClass(task.status()));
      taskStatusBox.setManaged(viewMode == ViewMode.ADVANCED);
      taskStatusBox.setVisible(viewMode == ViewMode.ADVANCED);
      completedCheckBox.setManaged(viewMode == ViewMode.FOUNDATION);
      completedCheckBox.setVisible(viewMode == ViewMode.FOUNDATION);
      applyCompletionStyle(task);
      setGraphic(row);
    }

    private void applyCompletionStyle(TaskItem task) {
      row.pseudoClassStateChanged(COMPLETED, task.completed());
      taskTitle.setStrikethrough(task.completed());
    }

    private String statusStyleClass(TaskStatus status) {
      return switch (status) {
        case ACTIVE -> "status-active";
        case IN_REVIEW -> "status-review";
        case COMPLETED -> "status-completed";
      };
    }
  }

  private static final class PriorityCell extends ListCell<TaskPriority> {
    @Override
    protected void updateItem(TaskPriority priority, boolean empty) {
      super.updateItem(priority, empty);
      setText(empty || priority == null ? null : priority.displayName());
    }
  }

  private static final class PriorityFilterCell extends ListCell<PriorityFilter> {
    @Override
    protected void updateItem(PriorityFilter filter, boolean empty) {
      super.updateItem(filter, empty);
      setText(empty || filter == null ? null : filter.displayName());
    }
  }

  private static final class StatusCell extends ListCell<TaskStatus> {
    @Override
    protected void updateItem(TaskStatus status, boolean empty) {
      super.updateItem(status, empty);
      setText(empty || status == null ? null : status.displayName());
    }
  }

  private enum ViewMode {
    FOUNDATION,
    ADVANCED
  }

  private enum StorageMode {
    CONNECTING,
    DATABASE,
    MEMORY
  }

  private enum StorageHealth {
    CONNECTING("Connecting", "storage-connecting"),
    ONLINE("Database online", "storage-online"),
    OFFLINE("Database offline", "storage-offline");

    private final String displayName;
    private final String styleClass;

    StorageHealth(String displayName, String styleClass) {
      this.displayName = displayName;
      this.styleClass = styleClass;
    }

    private String displayName() {
      return displayName;
    }

    private String styleClass() {
      return styleClass;
    }
  }

  private enum TaskFilter {
    ALL,
    ACTIVE,
    IN_REVIEW,
    COMPLETED;

    private boolean matches(TaskItem task) {
      return switch (this) {
        case ACTIVE -> task.status() == TaskStatus.ACTIVE;
        case IN_REVIEW -> task.status() == TaskStatus.IN_REVIEW;
        case COMPLETED -> task.completed();
        case ALL -> true;
      };
    }
  }

  private enum PriorityFilter {
    ALL("All"),
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    private final String displayName;

    PriorityFilter(String displayName) {
      this.displayName = displayName;
    }

    private String displayName() {
      return displayName;
    }

    private boolean matches(TaskItem task) {
      return switch (this) {
        case HIGH -> task.priority() == TaskPriority.HIGH;
        case MEDIUM -> task.priority() == TaskPriority.MEDIUM;
        case LOW -> task.priority() == TaskPriority.LOW;
        case ALL -> true;
      };
    }
  }
}
