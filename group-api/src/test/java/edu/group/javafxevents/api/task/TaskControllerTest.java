package edu.group.javafxevents.api.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

class TaskControllerTest {

  @Test
  void createsActiveTaskWithMediumPriorityByDefault() throws Exception {
    var response = taskResponse(TaskPriority.MEDIUM, TaskStatus.ACTIVE);
    var useCase = new FakeTaskUseCase(response);

    mockMvc(useCase)
        .perform(
            post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Prepare database demo\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(7))
        .andExpect(jsonPath("$.priority").value("MEDIUM"))
        .andExpect(jsonPath("$.status").value("ACTIVE"));

    assertThat(useCase.createdRequest.priority()).isEqualTo(TaskPriority.MEDIUM);
  }

  @Test
  void updatesTaskStatus() throws Exception {
    var response = taskResponse(TaskPriority.HIGH, TaskStatus.IN_REVIEW);
    var useCase = new FakeTaskUseCase(response);

    mockMvc(useCase)
        .perform(
            patch("/api/v1/tasks/7")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_REVIEW\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("IN_REVIEW"));

    assertThat(useCase.updatedTaskId).isEqualTo(7);
    assertThat(useCase.updatedRequest.status()).isEqualTo(TaskStatus.IN_REVIEW);
  }

  @Test
  void rejectsBlankTitleAndEmptyUpdate() throws Exception {
    MockMvc mockMvc = mockMvc(new FakeTaskUseCase(null));

    mockMvc
        .perform(
            post("/api/v1/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"   \"}"))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(patch("/api/v1/tasks/7").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void clearsCompletedTasksThroughLiteralRoute() throws Exception {
    var useCase = new FakeTaskUseCase(null);

    mockMvc(useCase)
        .perform(delete("/api/v1/tasks/completed"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.removedCount").value(2));

    assertThat(useCase.clearedCompleted).isTrue();
  }

  private TaskResponse taskResponse(TaskPriority priority, TaskStatus status) {
    Instant now = Instant.parse("2026-07-18T12:00:00Z");
    return new TaskResponse(7, "Prepare database demo", priority, status, now, now);
  }

  private MockMvc mockMvc(TaskUseCase useCase) {
    var validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();
    return MockMvcBuilders.standaloneSetup(new TaskController(useCase))
        .setControllerAdvice(new TaskExceptionHandler())
        .setValidator(validator)
        .build();
  }

  private static final class FakeTaskUseCase implements TaskUseCase {
    private final TaskResponse response;
    private CreateTaskRequest createdRequest;
    private long updatedTaskId;
    private UpdateTaskRequest updatedRequest;
    private boolean clearedCompleted;

    private FakeTaskUseCase(TaskResponse response) {
      this.response = response;
    }

    @Override
    public List<TaskResponse> findAll() {
      return response == null ? List.of() : List.of(response);
    }

    @Override
    public TaskResponse create(CreateTaskRequest request) {
      createdRequest = request;
      return response;
    }

    @Override
    public TaskResponse update(long taskId, UpdateTaskRequest request) {
      updatedTaskId = taskId;
      updatedRequest = request;
      return response;
    }

    @Override
    public void delete(long taskId) {}

    @Override
    public ClearCompletedResponse clearCompleted() {
      clearedCompleted = true;
      return new ClearCompletedResponse(2);
    }
  }
}
