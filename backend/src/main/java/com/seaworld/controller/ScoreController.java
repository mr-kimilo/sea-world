package com.seaworld.controller;

import com.seaworld.dto.ApiResponse;
import com.seaworld.dto.ScoreRequest;
import com.seaworld.dto.ScoreResponse;
import com.seaworld.entity.User;
import com.seaworld.service.ScoreService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/families/{familyId}/children/{childId}/scores")
@RequiredArgsConstructor
@Validated
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ScoreResponse>> addScore(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId,
            @Valid @RequestBody ScoreRequest request) {
        ScoreResponse response = scoreService.addScore(currentUser, familyId, childId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ResponseMessages.SCORE_RECORDED.getMessage(), response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ScoreResponse>>> getHistory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId,
            @RequestParam(defaultValue = "0") @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String period) {
        Page<ScoreResponse> history = scoreService.getHistory(currentUser, familyId, childId,
                page, size, category, period);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getCategorySummary(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId,
            @RequestParam(required = false) String period) {
        Map<String, Integer> summary = scoreService.getCategorySummary(currentUser, familyId, childId, period);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @DeleteMapping("/{scoreId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteScore(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId,
            @PathVariable UUID scoreId) {
        scoreService.deleteScore(currentUser, familyId, childId, scoreId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.SCORE_DELETED.getMessage(), null));
    }
}
