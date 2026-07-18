package edu.group.javafxevents;

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
                    "fx:id=\"nameField\"",
                    "fx:id=\"playground\"",
                    "fx:id=\"marker\"",
                    "#handleGreeting",
                    "#handlePlaygroundClick",
                    "#handleReset",
                    "#handleExit"
                }) {
            assertTrue(fxml.contains(expected), () -> "Missing FXML contract value: " + expected);
        }
    }
}
