module sample.JavaFX_EventHandling {
    requires javafx.controls;
    requires javafx.fxml;

    opens sample.JavaFX_EventHandling to javafx.fxml;
    exports sample.JavaFX_EventHandling;
}
