package edu.group.javafxevents.api.interaction;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InteractionService implements InteractionUseCase {

  private final InteractionEventRepository repository;
  private final Clock clock = Clock.systemUTC();

  public InteractionService(InteractionEventRepository repository) {
    this.repository = repository;
  }

  @Transactional
  @Override
  public InteractionResponse record(CreateInteractionRequest request) {
    var event = InteractionEventEntity.from(request, Instant.now(clock));
    return InteractionResponse.from(repository.save(event));
  }

  @Transactional(readOnly = true)
  @Override
  public List<InteractionResponse> recent(int limit) {
    return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).stream()
        .map(InteractionResponse::from)
        .toList();
  }
}
