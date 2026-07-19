package edu.group.javafxevents.api.task;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface TaskRepository extends JpaRepository<TaskEntity, Long> {

  List<TaskEntity> findAllByOrderByIdAsc();

  boolean existsByNormalizedTitle(String normalizedTitle);

  long deleteByStatus(TaskStatus status);
}
