package edu.group.javafxevents;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public final class EventHandlingApp extends Application {
  private static final String VIEW_RESOURCE = "event-handling-view.fxml";
  private static final String STYLESHEET_RESOURCE = "event-handling.css";

  @Override
  public void start(Stage stage) throws IOException {
    URL viewUrl = requireResource(VIEW_RESOURCE);
    Parent root = FXMLLoader.load(viewUrl);
    Scene scene = new Scene(root, 880, 680);
    scene.getStylesheets().add(requireResource(STYLESHEET_RESOURCE).toExternalForm());

    stage.setMinWidth(760);
    stage.setMinHeight(600);
    stage.setTitle("JavaFX Task List · Foundation & Advanced");
    stage.setScene(scene);
    stage.show();
  }

  private URL requireResource(String resourceName) {
    return Objects.requireNonNull(
        EventHandlingApp.class.getResource(resourceName),
        () -> "Required classpath resource is missing: " + resourceName);
  }

  public static void main(String[] args) {
    launch(args);
  }
}
