package edu.group.javafxevents;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/** Java 21 HTTP adapter for the Spring Boot task API. */
final class HttpTaskGateway implements TaskGateway {
  private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);
  private static final String TASKS_PATH = "api/v1/tasks";
  private static final TypeReference<List<TaskPayload>> TASK_LIST_TYPE = new TypeReference<>() {};

  private final URI baseUri;
  private final HttpClient httpClient;
  private final ObjectMapper objectMapper;

  HttpTaskGateway() {
    this(defaultBaseUri());
  }

  HttpTaskGateway(URI baseUri) {
    this(
        validateBaseUri(baseUri),
        HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build(),
        new ObjectMapper().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES));
  }

  HttpTaskGateway(URI baseUri, HttpClient httpClient, ObjectMapper objectMapper) {
    this.baseUri = validateBaseUri(baseUri);
    this.httpClient = httpClient;
    this.objectMapper =
        objectMapper.copy().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
  }

  @Override
  public CompletableFuture<List<TaskItem>> findAll() {
    HttpRequest request = requestBuilder(TASKS_PATH).GET().build();
    return send(request, 200)
        .thenApply(
            body -> read(body, TASK_LIST_TYPE).stream().map(TaskPayload::toTaskItem).toList());
  }

  @Override
  public CompletableFuture<TaskItem> create(String title, TaskPriority priority) {
    return jsonRequest(TASKS_PATH, "POST", Map.of("title", title, "priority", priority.name()), 201)
        .thenApply(body -> read(body, TaskPayload.class).toTaskItem());
  }

  @Override
  public CompletableFuture<TaskItem> updateStatus(long taskId, TaskStatus status) {
    return jsonRequest(TASKS_PATH + "/" + taskId, "PATCH", Map.of("status", status.name()), 200)
        .thenApply(body -> read(body, TaskPayload.class).toTaskItem());
  }

  @Override
  public CompletableFuture<TaskItem> updatePriority(long taskId, TaskPriority priority) {
    return jsonRequest(TASKS_PATH + "/" + taskId, "PATCH", Map.of("priority", priority.name()), 200)
        .thenApply(body -> read(body, TaskPayload.class).toTaskItem());
  }

  @Override
  public CompletableFuture<Void> delete(long taskId) {
    HttpRequest request = requestBuilder(TASKS_PATH + "/" + taskId).DELETE().build();
    return send(request, 204).thenApply(ignored -> null);
  }

  @Override
  public CompletableFuture<Integer> clearCompleted() {
    HttpRequest request = requestBuilder(TASKS_PATH + "/completed").DELETE().build();
    return send(request, 200)
        .thenApply(body -> Math.toIntExact(read(body, ClearCompletedPayload.class).removedCount()));
  }

  private CompletableFuture<String> jsonRequest(
      String path, String method, Object payload, int expectedStatus) {
    try {
      String json = objectMapper.writeValueAsString(payload);
      HttpRequest request =
          requestBuilder(path)
              .header("Content-Type", "application/json")
              .method(method, HttpRequest.BodyPublishers.ofString(json))
              .build();
      return send(request, expectedStatus);
    } catch (JsonProcessingException exception) {
      return CompletableFuture.failedFuture(
          new TaskApiException("Could not prepare the task request.", exception));
    }
  }

  private CompletableFuture<String> send(HttpRequest request, int expectedStatus) {
    return httpClient
        .sendAsync(request, HttpResponse.BodyHandlers.ofString())
        .handle(
            (response, failure) -> {
              if (failure != null) {
                throw new TaskApiException(
                    "Task API is unavailable at " + baseUri.getAuthority() + ".", failure, true);
              }
              if (response.statusCode() != expectedStatus) {
                throw new TaskApiException(problemDetail(response));
              }
              return response.body();
            });
  }

  private String problemDetail(HttpResponse<String> response) {
    try {
      ApiProblem problem = objectMapper.readValue(response.body(), ApiProblem.class);
      if (problem.detail() != null && !problem.detail().isBlank()) {
        return problem.detail();
      }
    } catch (JsonProcessingException ignored) {
      // A stable status-based message is safer than exposing an unexpected server response.
    }
    return "Task API request failed with status " + response.statusCode() + ".";
  }

  private HttpRequest.Builder requestBuilder(String path) {
    return HttpRequest.newBuilder(baseUri.resolve(path))
        .timeout(REQUEST_TIMEOUT)
        .header("Accept", "application/json");
  }

  private <T> T read(String json, Class<T> responseType) {
    try {
      return objectMapper.readValue(json, responseType);
    } catch (JsonProcessingException exception) {
      throw new TaskApiException("Task API returned an invalid response.", exception);
    }
  }

  private <T> T read(String json, TypeReference<T> responseType) {
    try {
      return objectMapper.readValue(json, responseType);
    } catch (JsonProcessingException exception) {
      throw new TaskApiException("Task API returned an invalid response.", exception);
    }
  }

  private static URI defaultBaseUri() {
    String configured = System.getProperty("group.api.base-url");
    if (configured == null || configured.isBlank()) {
      configured = System.getenv().getOrDefault("GROUP_API_BASE_URL", "http://127.0.0.1:8081");
    }
    return URI.create(configured.endsWith("/") ? configured : configured + "/");
  }

  private static URI validateBaseUri(URI baseUri) {
    if (baseUri == null) {
      throw new IllegalArgumentException("Configure a valid HTTP task API URL.");
    }
    boolean validAuthority = baseUri.getHost() != null && baseUri.getUserInfo() == null;
    boolean validScheme =
        "http".equalsIgnoreCase(baseUri.getScheme())
            || "https".equalsIgnoreCase(baseUri.getScheme());
    if (!validAuthority || !validScheme) {
      throw new IllegalArgumentException("Configure a valid HTTP task API URL.");
    }
    String normalized = baseUri.toString();
    return URI.create(normalized.endsWith("/") ? normalized : normalized + "/");
  }

  private record TaskPayload(long id, String title, String priority, String status) {
    private TaskItem toTaskItem() {
      try {
        return new TaskItem(
            id,
            title,
            TaskPriority.valueOf(priority.toUpperCase(Locale.ROOT)),
            TaskStatus.valueOf(status.toUpperCase(Locale.ROOT)));
      } catch (IllegalArgumentException | NullPointerException exception) {
        throw new TaskApiException("Task API returned an unsupported task value.", exception);
      }
    }
  }

  private record ClearCompletedPayload(long removedCount) {}

  private record ApiProblem(String detail) {}
}
