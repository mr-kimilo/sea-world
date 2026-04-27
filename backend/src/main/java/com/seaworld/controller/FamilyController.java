package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.entity.User;
import com.seaworld.service.FamilyService;
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
@RequestMapping("/api/families")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<FamilyResponse>> createFamily(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateFamilyRequest request) {
        FamilyResponse response = familyService.createFamily(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ResponseMessages.FAMILY_CREATED.getMessage(), response));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<FamilyResponse>>> getMyFamilies(
            @AuthenticationPrincipal User currentUser) {
        List<FamilyResponse> families = familyService.getMyFamilies(currentUser);
        return ResponseEntity.ok(ApiResponse.ok(families));
    }

    @PostMapping("/{familyId}/children")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ChildResponse>> addChild(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @Valid @RequestBody ChildRequest request) {
        ChildResponse response = familyService.addChild(currentUser, familyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(ResponseMessages.CHILD_ADDED.getMessage(), response));
    }

    @GetMapping("/{familyId}/children")
    public ResponseEntity<ApiResponse<List<ChildResponse>>> getChildren(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId) {
        List<ChildResponse> children = familyService.getChildren(currentUser, familyId);
        return ResponseEntity.ok(ApiResponse.ok(children));
    }

    @PutMapping("/{familyId}/children/{childId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ChildResponse>> updateChild(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId,
            @Valid @RequestBody ChildRequest request) {
        ChildResponse response = familyService.updateChild(currentUser, familyId, childId, request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.CHILD_UPDATED.getMessage(), response));
    }

    @DeleteMapping("/{familyId}/children/{childId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteChild(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @PathVariable UUID childId) {
        familyService.deleteChild(currentUser, familyId, childId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.CHILD_DELETED.getMessage()));
    }

    @PutMapping("/{familyId}")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<FamilyResponse>> updateFamily(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID familyId,
            @Valid @RequestBody UpdateFamilyRequest request) {
        FamilyResponse response = familyService.updateFamily(currentUser, familyId, request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.FAMILY_UPDATED.getMessage(), response));
    }
}
