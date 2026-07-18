package edu.group.javafxevents.api.interaction;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateInteractionRequest(
    @NotNull InteractionType type,
    @Size(max = 120) String message,
    Double xCoordinate,
    Double yCoordinate) {

  @AssertTrue(message = "The payload does not match the selected interaction type.")
  public boolean isPayloadValid() {
    if (type == null) {
      return true;
    }

    return switch (type) {
      case GREETING -> message != null && !message.isBlank() && noCoordinates();
      case CANVAS_CLICK -> validCoordinate(xCoordinate) && validCoordinate(yCoordinate);
      case RESET -> noCoordinates();
    };
  }

  private boolean noCoordinates() {
    return xCoordinate == null && yCoordinate == null;
  }

  private boolean validCoordinate(Double coordinate) {
    return coordinate != null && Double.isFinite(coordinate) && coordinate >= 0;
  }
}
