package edu.group.javafxevents;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.Authenticator;
import java.net.CookieHandler;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSession;
import org.junit.jupiter.api.Test;

class HttpTaskGatewayTest {

  @Test
  void mapsTaskApiResponseIntoDesktopModel() {
    var httpClient =
        new StubHttpClient(
            200,
            """
            [{"id":12,"title":"Persisted task","priority":"HIGH","status":"IN_REVIEW"}]
            """);
    var gateway =
        new HttpTaskGateway(URI.create("http://127.0.0.1:8081/"), httpClient, new ObjectMapper());

    TaskItem task = gateway.findAll().join().getFirst();

    assertEquals(12, task.id());
    assertEquals(TaskPriority.HIGH, task.priority());
    assertEquals(TaskStatus.IN_REVIEW, task.status());
    assertEquals("/api/v1/tasks", httpClient.lastRequest.uri().getPath());
  }

  @Test
  void sendsTaskCreationAsJsonWithoutDatabaseCredentials() {
    var httpClient =
        new StubHttpClient(
            201,
            """
            {"id":3,"title":"API task","priority":"MEDIUM","status":"ACTIVE"}
            """);
    var gateway =
        new HttpTaskGateway(URI.create("http://127.0.0.1:8081/"), httpClient, new ObjectMapper());

    TaskItem task = gateway.create("API task", TaskPriority.MEDIUM).join();

    assertEquals(3, task.id());
    assertEquals("POST", httpClient.lastRequest.method());
    assertTrue(httpClient.lastRequestBody.contains("\"priority\":\"MEDIUM\""));
    assertTrue(httpClient.lastRequestBody.contains("\"title\":\"API task\""));
  }

  @Test
  void exposesSafeApiProblemDetail() {
    var httpClient =
        new StubHttpClient(
            409,
            """
            {"title":"Duplicate task","status":409,"detail":"That task is already on the list."}
            """);
    var gateway =
        new HttpTaskGateway(URI.create("http://127.0.0.1:8081/"), httpClient, new ObjectMapper());

    var exception =
        assertThrows(
            java.util.concurrent.CompletionException.class,
            () -> gateway.create("Duplicate", TaskPriority.MEDIUM).join());

    assertTrue(exception.getCause() instanceof TaskApiException);
    assertEquals("That task is already on the list.", exception.getCause().getMessage());
  }

  private static final class StubHttpClient extends HttpClient {
    private final int statusCode;
    private final String responseBody;
    private HttpRequest lastRequest;
    private String lastRequestBody = "";

    private StubHttpClient(int statusCode, String responseBody) {
      this.statusCode = statusCode;
      this.responseBody = responseBody;
    }

    @Override
    public Optional<CookieHandler> cookieHandler() {
      return Optional.empty();
    }

    @Override
    public Optional<Duration> connectTimeout() {
      return Optional.of(Duration.ofSeconds(3));
    }

    @Override
    public Redirect followRedirects() {
      return Redirect.NEVER;
    }

    @Override
    public Optional<ProxySelector> proxy() {
      return Optional.empty();
    }

    @Override
    public SSLContext sslContext() {
      try {
        return SSLContext.getDefault();
      } catch (NoSuchAlgorithmException exception) {
        throw new IllegalStateException(exception);
      }
    }

    @Override
    public SSLParameters sslParameters() {
      return new SSLParameters();
    }

    @Override
    public Optional<Authenticator> authenticator() {
      return Optional.empty();
    }

    @Override
    public Version version() {
      return Version.HTTP_1_1;
    }

    @Override
    public Optional<Executor> executor() {
      return Optional.empty();
    }

    @Override
    public <T> HttpResponse<T> send(
        HttpRequest request, HttpResponse.BodyHandler<T> responseBodyHandler)
        throws IOException, InterruptedException {
      return sendAsync(request, responseBodyHandler).join();
    }

    @Override
    public <T> CompletableFuture<HttpResponse<T>> sendAsync(
        HttpRequest request, HttpResponse.BodyHandler<T> responseBodyHandler) {
      capture(request);
      return CompletableFuture.completedFuture(response(request));
    }

    @Override
    public <T> CompletableFuture<HttpResponse<T>> sendAsync(
        HttpRequest request,
        HttpResponse.BodyHandler<T> responseBodyHandler,
        HttpResponse.PushPromiseHandler<T> pushPromiseHandler) {
      return sendAsync(request, responseBodyHandler);
    }

    private void capture(HttpRequest request) {
      lastRequest = request;
      lastRequestBody =
          request
              .bodyPublisher()
              .map(
                  publisher -> {
                    var subscriber = new StringBodySubscriber();
                    publisher.subscribe(subscriber);
                    return subscriber.body.join();
                  })
              .orElse("");
    }

    @SuppressWarnings("unchecked")
    private <T> HttpResponse<T> response(HttpRequest request) {
      return (HttpResponse<T>) new StubHttpResponse(statusCode, responseBody, request);
    }
  }

  private static final class StringBodySubscriber
      implements java.util.concurrent.Flow.Subscriber<java.nio.ByteBuffer> {
    private final StringBuilder content = new StringBuilder();
    private final CompletableFuture<String> body = new CompletableFuture<>();

    @Override
    public void onSubscribe(java.util.concurrent.Flow.Subscription subscription) {
      subscription.request(Long.MAX_VALUE);
    }

    @Override
    public void onNext(java.nio.ByteBuffer item) {
      byte[] bytes = new byte[item.remaining()];
      item.get(bytes);
      content.append(new String(bytes, java.nio.charset.StandardCharsets.UTF_8));
    }

    @Override
    public void onError(Throwable throwable) {
      body.completeExceptionally(throwable);
    }

    @Override
    public void onComplete() {
      body.complete(content.toString());
    }
  }

  private record StubHttpResponse(int statusCode, String body, HttpRequest request)
      implements HttpResponse<String> {

    @Override
    public Optional<HttpResponse<String>> previousResponse() {
      return Optional.empty();
    }

    @Override
    public HttpHeaders headers() {
      return HttpHeaders.of(java.util.Map.of(), (name, value) -> true);
    }

    @Override
    public Optional<SSLSession> sslSession() {
      return Optional.empty();
    }

    @Override
    public URI uri() {
      return request.uri();
    }

    @Override
    public HttpClient.Version version() {
      return HttpClient.Version.HTTP_1_1;
    }
  }
}
