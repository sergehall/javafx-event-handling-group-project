package edu.group.javafxevents.api.interaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class InteractionPersistenceTest {

  @Autowired private InteractionEventRepository repository;

  @Test
  void persistsInteractionThroughFlywayManagedSchema() {
    var request =
        new CreateInteractionRequest(InteractionType.GREETING, "  Hello team  ", null, null);
    var event = InteractionEventEntity.from(request, Instant.parse("2026-07-18T12:00:00Z"));

    var saved = repository.saveAndFlush(event);

    assertThat(saved.getId()).isPositive();
    assertThat(saved.getMessage()).isEqualTo("Hello team");
    assertThat(repository.findById(saved.getId())).isPresent();
  }
}
