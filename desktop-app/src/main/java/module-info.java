module edu.group.javafxevents {
  requires com.fasterxml.jackson.databind;
  requires java.net.http;
  requires javafx.controls;
  requires javafx.fxml;

  exports edu.group.javafxevents;

  opens edu.group.javafxevents to
      com.fasterxml.jackson.databind,
      javafx.fxml;
}
