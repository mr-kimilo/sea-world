package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.entity.CustomScoreCategory;
import com.seaworld.entity.User;
import com.seaworld.repository.ScoreRecordRepository;
import com.seaworld.service.CustomScoreCategoryService;
import com.seaworld.service.FamilyService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 自定义积分维度控制器
 */
@RestController
@RequestMapping("/api/custom-categories")
@RequiredArgsConstructor
@Validated
public class CustomCategoryController {

    private final CustomScoreCategoryService categoryService;
    private final FamilyService familyService;
    private final ScoreRecordRepository scoreRecordRepository;

    /**
     * 获取当前用户家庭的所有自定义维度
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomCategoryResponse>>> getCategories(
            @AuthenticationPrincipal User currentUser) {

        // 从当前用户获取家庭ID
        UUID familyId = familyService.getUserFamilyId(currentUser.getId());

        List<CustomScoreCategory> categories = categoryService.getCategoriesByFamily(familyId);

        // 为每个维度统计积分记录数量
        List<CustomCategoryResponse> responses = categories.stream()
                .map(category -> {
                    long scoreCount = scoreRecordRepository.countByCustomCategoryId(category.getId());
                    return CustomCategoryResponse.fromEntity(category, scoreCount);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    /**
     * 创建自定义维度
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomCategoryResponse>> createCategory(
            @Valid @RequestBody CreateCustomCategoryRequest request,
            @AuthenticationPrincipal User currentUser) {

        // 从当前用户获取家庭ID
        UUID familyId = familyService.getUserFamilyId(currentUser.getId());

        CustomScoreCategory category = categoryService.createCategory(
                familyId,
                request.getName(),
                request.getIcon()
        );

        CustomCategoryResponse response = CustomCategoryResponse.fromEntity(category, 0L);

        return ResponseEntity.ok(ApiResponse.ok(
                ResponseMessages.CUSTOM_CATEGORY_CREATED.getMessage(),
                response
        ));
    }

    /**
     * 更新自定义维度
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CustomCategoryResponse>> updateCategory(
            @PathVariable UUID categoryId,
            @Valid @RequestBody UpdateCustomCategoryRequest request,
            @AuthenticationPrincipal User currentUser) {

        // 从当前用户获取家庭ID
        UUID familyId = familyService.getUserFamilyId(currentUser.getId());

        CustomScoreCategory category = categoryService.updateCategory(
                familyId,
                categoryId,
                request.getName(),
                request.getIcon()
        );

        long scoreCount = scoreRecordRepository.countByCustomCategoryId(categoryId);
        CustomCategoryResponse response = CustomCategoryResponse.fromEntity(category, scoreCount);

        return ResponseEntity.ok(ApiResponse.ok(
                ResponseMessages.CUSTOM_CATEGORY_UPDATED.getMessage(),
                response
        ));
    }

    /**
     * 删除自定义维度
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable UUID categoryId,
            @AuthenticationPrincipal User currentUser) {

        // 从当前用户获取家庭ID
        UUID familyId = familyService.getUserFamilyId(currentUser.getId());

        categoryService.deleteCategory(familyId, categoryId);

        return ResponseEntity.ok(ApiResponse.ok(
                ResponseMessages.CUSTOM_CATEGORY_DELETED.getMessage()
        ));
    }
}
