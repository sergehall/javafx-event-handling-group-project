package edu.group.javafxevents.api.interaction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/interactions")
public class InteractionController {

  private final InteractionUseCase useCase;

  public InteractionController(InteractionUseCase useCase) {
    this.useCase = useCase;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public InteractionResponse record(@Valid @RequestBody CreateInteractionRequest request) {
    return useCase.record(request);
  }

  @GetMapping
  public List<InteractionResponse> recent(
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
    return useCase.recent(limit);
  }
}
