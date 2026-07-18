package edu.group.javafxevents.api.interaction;

import java.time.Instant;

public record InteractionResponse(
    long id,
    InteractionType type,
    String message,
    Double xCoordinate,
    Double yCoordinate,
    Instant createdAt) {

  static InteractionResponse from(InteractionEventEntity entity) {
    return new InteractionResponse(
        entity.getId(),
        entity.getType(),
        entity.getMessage(),
        entity.getXCoordinate(),
        entity.getYCoordinate(),
        entity.getCreatedAt());
  }
}
