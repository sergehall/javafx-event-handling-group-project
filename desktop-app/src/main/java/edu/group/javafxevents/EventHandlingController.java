package edu.group.javafxevents;

import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Ellipse;
import javafx.scene.shape.Rectangle;

public final class EventHandlingController {
  private static final double INITIAL_MARKER_X = 70;
  private static final double INITIAL_MARKER_Y = 70;

  private final InteractionModel model = new InteractionModel();

  @FXML private TextField nameField;

  @FXML private Label greetingLabel;

  @FXML private Label statusLabel;

  @FXML private Pane playground;

  @FXML private Circle marker;

  @FXML private Rectangle anchorRectangle;

  @FXML private Ellipse centerEllipse;

  @FXML
  private void initialize() {
    anchorRectangle.xProperty().bind(playground.widthProperty().multiply(0.18));
    anchorRectangle.yProperty().bind(playground.heightProperty().multiply(0.2));
    centerEllipse.centerXProperty().bind(playground.widthProperty().multiply(0.5));
    centerEllipse.centerYProperty().bind(playground.heightProperty().multiply(0.55));
    resetView();
  }

  @FXML
  private void handleGreeting(ActionEvent event) {
    greetingLabel.setText(model.createGreeting(nameField.getText()));
    nameField.clear();
    nameField.requestFocus();
    event.consume();
  }

  @FXML
  private void handlePlaygroundClick(MouseEvent event) {
    marker.setCenterX(event.getX());
    marker.setCenterY(event.getY());
    statusLabel.setText(model.recordCanvasClick(event.getX(), event.getY()));
    event.consume();
  }

  @FXML
  private void handleReset(ActionEvent event) {
    model.reset();
    resetView();
    nameField.clear();
    nameField.requestFocus();
    event.consume();
  }

  @FXML
  private void handleExit(ActionEvent event) {
    event.consume();
    Platform.exit();
  }

  private void resetView() {
    greetingLabel.setText(InteractionModel.DEFAULT_GREETING);
    statusLabel.setText(InteractionModel.DEFAULT_STATUS);
    marker.setCenterX(INITIAL_MARKER_X);
    marker.setCenterY(INITIAL_MARKER_Y);
  }
}
