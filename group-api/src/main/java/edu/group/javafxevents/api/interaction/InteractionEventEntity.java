package edu.group.javafxevents.api.interaction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "interaction_events")
class InteractionEventEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "event_type", nullable = false, length = 32)
  private InteractionType type;

  @Column(length = 120)
  private String message;

  @Column(name = "x_coordinate")
  private Double xCoordinate;

  @Column(name = "y_coordinate")
  private Double yCoordinate;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected InteractionEventEntity() {}

  private InteractionEventEntity(
      InteractionType type,
      String message,
      Double xCoordinate,
      Double yCoordinate,
      Instant createdAt) {
    this.type = type;
    this.message = normalize(message);
    this.xCoordinate = xCoordinate;
    this.yCoordinate = yCoordinate;
    this.createdAt = createdAt;
  }

  static InteractionEventEntity from(CreateInteractionRequest request, Instant createdAt) {
    return new InteractionEventEntity(
        request.type(), request.message(), request.xCoordinate(), request.yCoordinate(), createdAt);
  }

  Long getId() {
    return id;
  }

  InteractionType getType() {
    return type;
  }

  String getMessage() {
    return message;
  }

  Double getXCoordinate() {
    return xCoordinate;
  }

  Double getYCoordinate() {
    return yCoordinate;
  }

  Instant getCreatedAt() {
    return createdAt;
  }

  private static String normalize(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
