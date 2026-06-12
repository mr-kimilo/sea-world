package com.seaworld.repository;

import com.seaworld.entity.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, UUID> {
    List<TaskTemplate> findByGradeAndIsActiveTrueOrderBySortOrder(String grade);
    List<TaskTemplate> findByIsActiveTrueOrderBySortOrder();
}
