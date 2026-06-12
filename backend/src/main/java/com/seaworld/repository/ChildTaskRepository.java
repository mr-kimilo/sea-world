package com.seaworld.repository;

import com.seaworld.entity.ChildTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildTaskRepository extends JpaRepository<ChildTask, UUID> {
    List<ChildTask> findByChildIdOrderByCreatedAtDesc(UUID childId);
    List<ChildTask> findByFamilyIdOrderByCreatedAtDesc(UUID familyId);
    List<ChildTask> findByChildIdAndStatusOrderByCreatedAtDesc(UUID childId, String status);
    long countByChildIdAndStatus(UUID childId, String status);
}
