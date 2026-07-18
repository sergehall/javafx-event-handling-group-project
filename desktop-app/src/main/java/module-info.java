module edu.group.javafxevents {
    requires javafx.controls;
    requires javafx.fxml;

    exports edu.group.javafxevents;
    opens edu.group.javafxevents to javafx.fxml;
}
