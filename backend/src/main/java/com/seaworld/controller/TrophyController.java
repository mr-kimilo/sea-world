package com.seaworld.controller;

import com.seaworld.dto.ApiResponse;
import com.seaworld.dto.TrophyResponse;
import com.seaworld.entity.User;
import com.seaworld.service.TrophyService;
import com.seaworld.util.ResponseMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TrophyController {

    private final TrophyService trophyService;

    @GetMapping("/children/{childId}/trophies")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TrophyResponse>>> getTrophies(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<TrophyResponse> trophies = trophyService.getTrophies(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TROPHIES_RETRIEVED.getMessage(), trophies));
    }

    @GetMapping("/children/{childId}/trophies/top3")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TrophyResponse>>> getTop3Trophies(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<TrophyResponse> top3 = trophyService.getTop3Trophies(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(top3));
    }
}
