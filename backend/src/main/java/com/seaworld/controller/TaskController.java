package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.entity.User;
import com.seaworld.service.TaskService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // ─── Task Templates ───

    @GetMapping("/task-templates")
    public ResponseEntity<ApiResponse<List<TaskTemplateResponse>>> getTemplates(
            @RequestParam(required = false) String grade) {
        List<TaskTemplateResponse> templates = taskService.getTemplates(grade);
        return ResponseEntity.ok(ApiResponse.ok(templates));
    }

    // ─── Child Tasks ───

    @GetMapping("/children/{childId}/tasks")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ChildTaskResponse>>> getChildTasks(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<ChildTaskResponse> tasks = taskService.getChildTasks(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @GetMapping("/families/{familyId}/tasks")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ChildTaskResponse>>> getFamilyTasks(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId) {
        List<ChildTaskResponse> tasks = taskService.getFamilyTasks(currentUser, familyId);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @PostMapping("/families/{familyId}/tasks")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ChildTaskResponse>> createTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @Valid @RequestBody ChildTaskRequest request) {
        ChildTaskResponse response = taskService.createTask(currentUser, familyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ResponseMessages.TASK_CREATED.getMessage(), response));
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ChildTaskResponse>> updateTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID taskId,
            @Valid @RequestBody ChildTaskRequest request) {
        ChildTaskResponse response = taskService.updateTask(currentUser, taskId, request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TASK_UPDATED.getMessage(), response));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID taskId) {
        taskService.deleteTask(currentUser, taskId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TASK_DELETED.getMessage()));
    }

    // ─── Task Actions ───

    @PostMapping("/tasks/{taskId}/complete")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<TrophyResponse>> completeTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID taskId) {
        TrophyResponse response = taskService.completeTask(currentUser, taskId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TASK_COMPLETED.getMessage(), response));
    }

    @PostMapping("/tasks/{taskId}/cancel")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ChildTaskResponse>> cancelTask(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID taskId) {
        ChildTaskResponse response = taskService.cancelTask(currentUser, taskId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TASK_CANCELLED.getMessage(), response));
    }
}
