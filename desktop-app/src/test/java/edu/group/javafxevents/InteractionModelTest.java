package edu.group.javafxevents;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class InteractionModelTest {
    private final InteractionModel model = new InteractionModel();

    @Test
    void createsGreetingFromTrimmedName() {
        assertEquals("Hello, Ada!", model.createGreeting("  Ada  "));
    }

    @Test
    void requestsANameWhenInputIsBlank() {
        assertEquals("Please enter your name.", model.createGreeting("   "));
        assertEquals("Please enter your name.", model.createGreeting(null));
    }

    @Test
    void rejectsNamesLongerThanFortyCharacters() {
        assertEquals(
                "Please use a name with 40 characters or fewer.",
                model.createGreeting("a".repeat(41)));
    }

    @Test
    void recordsClickCoordinatesAndCount() {
        assertEquals("Canvas click #1 at (24, 36)", model.recordCanvasClick(24.4, 35.6));
        assertEquals("Canvas click #2 at (80, 120)", model.recordCanvasClick(80, 120));
        assertEquals(2, model.getClickCount());
        assertEquals(80, model.getLastClickX());
        assertEquals(120, model.getLastClickY());
    }

    @Test
    void rejectsInvalidCoordinates() {
        assertThrows(IllegalArgumentException.class, () -> model.recordCanvasClick(-1, 10));
        assertThrows(IllegalArgumentException.class, () -> model.recordCanvasClick(10, Double.NaN));
        assertThrows(IllegalArgumentException.class, () -> model.recordCanvasClick(Double.POSITIVE_INFINITY, 10));
    }

    @Test
    void resetClearsRecordedClickState() {
        model.recordCanvasClick(12, 18);

        model.reset();

        assertEquals(0, model.getClickCount());
        assertEquals(0, model.getLastClickX());
        assertEquals(0, model.getLastClickY());
    }
}
