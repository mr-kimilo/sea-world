package com.seaworld.service;

import com.seaworld.dto.ChildTaskRequest;
import com.seaworld.dto.ChildTaskResponse;
import com.seaworld.dto.TaskTemplateResponse;
import com.seaworld.dto.TrophyResponse;
import com.seaworld.entity.Child;
import com.seaworld.entity.ChildTask;
import com.seaworld.entity.Trophy;
import com.seaworld.entity.User;
import com.seaworld.exception.BusinessException;
import com.seaworld.exception.ForbiddenException;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ChildRepository;
import com.seaworld.repository.ChildTaskRepository;
import com.seaworld.repository.TaskTemplateRepository;
import com.seaworld.repository.TrophyRepository;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskTemplateRepository taskTemplateRepository;
    private final ChildTaskRepository childTaskRepository;
    private final TrophyRepository trophyRepository;
    private final ChildRepository childRepository;
    private final FamilyService familyService;

    // ─── Task Templates ───

    public List<TaskTemplateResponse> getTemplates(String grade) {
        if (grade != null && !grade.isBlank()) {
            return taskTemplateRepository.findByGradeAndIsActiveTrueOrderBySortOrder(grade).stream()
                    .map(TaskTemplateResponse::from)
                    .toList();
        }
        return taskTemplateRepository.findByIsActiveTrueOrderBySortOrder().stream()
                .map(TaskTemplateResponse::from)
                .toList();
    }

    // ─── Child Tasks CRUD ───

    public List<ChildTaskResponse> getChildTasks(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), child.getFamilyId());
        return childTaskRepository.findByChildIdOrderByCreatedAtDesc(childId).stream()
                .map(ChildTaskResponse::from)
                .toList();
    }

    public List<ChildTaskResponse> getFamilyTasks(User requester, UUID familyId) {
        familyService.requireFamilyMember(requester.getId(), familyId);
        return childTaskRepository.findByFamilyIdOrderByCreatedAtDesc(familyId).stream()
                .map(ChildTaskResponse::from)
                .toList();
    }

    @Transactional
    public ChildTaskResponse createTask(User requester, UUID familyId, ChildTaskRequest request) {
        familyService.requireFamilyMember(requester.getId(), familyId);

        UUID childId = request.getChildId() != null ? UUID.fromString(request.getChildId()) : null;
        if (childId == null) {
            // 如果没有指定孩子，使用家庭中第一个孩子
            List<Child> children = childRepository.findByFamilyIdOrderByCreatedAt(familyId);
            if (children.isEmpty()) {
                throw new BusinessException(ErrorMessages.CHILD_NOT_FOUND.getMessage());
            }
            childId = children.get(0).getId();
        } else {
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
            if (!child.getFamilyId().equals(familyId)) {
                throw new ForbiddenException(ErrorMessages.CHILD_NOT_IN_FAMILY.getMessage());
            }
        }

        ChildTask task = ChildTask.builder()
                .childId(childId)
                .familyId(familyId)
                .createdBy(requester.getId())
                .name(request.getName())
                .description(request.getDescription())
                .points(request.getPoints())
                .icon(request.getIcon() != null ? request.getIcon() : "📋")
                .trophyName(request.getTrophyName())
                .status("PENDING")
                .build();
        task = childTaskRepository.save(task);
        return ChildTaskResponse.from(task);
    }

    @Transactional
    public ChildTaskResponse updateTask(User requester, UUID taskId, ChildTaskRequest request) {
        ChildTask task = childTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TASK_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), task.getFamilyId());

        task.setName(request.getName());
        task.setDescription(request.getDescription());
        task.setPoints(request.getPoints());
        task.setIcon(request.getIcon() != null ? request.getIcon() : "📋");
        task.setTrophyName(request.getTrophyName());
        if (request.getChildId() != null) {
            task.setChildId(UUID.fromString(request.getChildId()));
        }
        task = childTaskRepository.save(task);
        return ChildTaskResponse.from(task);
    }

    @Transactional
    public void deleteTask(User requester, UUID taskId) {
        ChildTask task = childTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TASK_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), task.getFamilyId());
        childTaskRepository.delete(task);
    }

    // ─── Task Actions ───

    @Transactional
    public TrophyResponse completeTask(User requester, UUID taskId) {
        ChildTask task = childTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TASK_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), task.getFamilyId());

        if ("COMPLETED".equals(task.getStatus())) {
            throw new BusinessException(ErrorMessages.TASK_ALREADY_COMPLETED.getMessage());
        }
        if ("CANCELLED".equals(task.getStatus())) {
            throw new BusinessException(ErrorMessages.TASK_ALREADY_CANCELLED.getMessage());
        }

        // Update task status
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        childTaskRepository.save(task);

        // Add points to child's available score
        Child child = childRepository.findById(task.getChildId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        child.setAvailableScore(child.getAvailableScore() + task.getPoints());
        childRepository.save(child);

        // Create trophy
        String trophyName = task.getTrophyName() != null ? task.getTrophyName() : task.getName();
        Trophy trophy = Trophy.builder()
                .childId(task.getChildId())
                .taskId(taskId)
                .name(trophyName)
                .points(task.getPoints())
                .icon(task.getIcon())
                .build();
        trophy = trophyRepository.save(trophy);

        return TrophyResponse.from(trophy);
    }

    @Transactional
    public ChildTaskResponse cancelTask(User requester, UUID taskId) {
        ChildTask task = childTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TASK_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), task.getFamilyId());

        if ("COMPLETED".equals(task.getStatus())) {
            throw new BusinessException(ErrorMessages.TASK_ALREADY_COMPLETED.getMessage());
        }

        task.setStatus("CANCELLED");
        task = childTaskRepository.save(task);
        return ChildTaskResponse.from(task);
    }
}
