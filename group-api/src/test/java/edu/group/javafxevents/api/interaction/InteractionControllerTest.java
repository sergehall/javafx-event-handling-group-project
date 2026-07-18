package edu.group.javafxevents.api.interaction;

import static org.assertj.core.api.Assertions.assertThat;
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

class InteractionControllerTest {

  @Test
  void recordsValidCanvasClick() throws Exception {
    var response =
        new InteractionResponse(
            1L,
            InteractionType.CANVAS_CLICK,
            null,
            42.5,
            18.0,
            Instant.parse("2026-07-18T12:00:00Z"));
    var useCase = new FakeInteractionUseCase(response);
    MockMvc mockMvc = mockMvc(useCase);

    mockMvc
        .perform(
            post("/api/v1/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "type": "CANVAS_CLICK",
                      "xCoordinate": 42.5,
                      "yCoordinate": 18.0
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.type").value("CANVAS_CLICK"));

    assertThat(useCase.recordedRequest.type()).isEqualTo(InteractionType.CANVAS_CLICK);
  }

  @Test
  void rejectsCanvasClickWithoutCoordinates() throws Exception {
    MockMvc mockMvc = mockMvc(new FakeInteractionUseCase(null));

    mockMvc
        .perform(
            post("/api/v1/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"CANVAS_CLICK\"}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void rejectsOversizedGreeting() throws Exception {
    String oversizedMessage = "x".repeat(121);
    MockMvc mockMvc = mockMvc(new FakeInteractionUseCase(null));

    mockMvc
        .perform(
            post("/api/v1/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"type":"GREETING","message":"%s"}
                    """
                        .formatted(oversizedMessage)))
        .andExpect(status().isBadRequest());
  }

  private MockMvc mockMvc(InteractionUseCase useCase) {
    var validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();
    return MockMvcBuilders.standaloneSetup(new InteractionController(useCase))
        .setValidator(validator)
        .build();
  }

  private static final class FakeInteractionUseCase implements InteractionUseCase {
    private final InteractionResponse response;
    private CreateInteractionRequest recordedRequest;

    private FakeInteractionUseCase(InteractionResponse response) {
      this.response = response;
    }

    @Override
    public InteractionResponse record(CreateInteractionRequest request) {
      recordedRequest = request;
      return response;
    }

    @Override
    public List<InteractionResponse> recent(int limit) {
      return List.of();
    }
  }
}
