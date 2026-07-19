package edu.group.javafxevents;

/** Describes a recoverable failure while communicating with the task API. */
final class TaskApiException extends RuntimeException {
  private final boolean connectivityFailure;

  TaskApiException(String message) {
    this(message, null, false);
  }

  TaskApiException(String message, Throwable cause) {
    this(message, cause, false);
  }

  TaskApiException(String message, Throwable cause, boolean connectivityFailure) {
    super(message, cause);
    this.connectivityFailure = connectivityFailure;
  }

  boolean isConnectivityFailure() {
    return connectivityFailure;
  }
}
