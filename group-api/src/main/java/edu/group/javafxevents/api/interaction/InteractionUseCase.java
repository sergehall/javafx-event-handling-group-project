package edu.group.javafxevents.api.interaction;

import java.util.List;

public interface InteractionUseCase {

  InteractionResponse record(CreateInteractionRequest request);

  List<InteractionResponse> recent(int limit);
}
