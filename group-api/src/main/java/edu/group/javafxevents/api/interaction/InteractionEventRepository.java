package edu.group.javafxevents.api.interaction;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface InteractionEventRepository extends JpaRepository<InteractionEventEntity, Long> {

  List<InteractionEventEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
