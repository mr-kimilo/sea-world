package com.seaworld.service;

import com.seaworld.entity.CustomScoreCategory;
import com.seaworld.exception.BusinessException;
import com.seaworld.repository.CustomScoreCategoryRepository;
import com.seaworld.repository.ScoreRecordRepository;
import com.seaworld.util.ErrorMessages;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 自定义积分维度服务
 */
@Service
public class CustomScoreCategoryService {

    private final CustomScoreCategoryRepository categoryRepository;
    private final ScoreRecordRepository scoreRecordRepository;

    public CustomScoreCategoryService(
            CustomScoreCategoryRepository categoryRepository,
            ScoreRecordRepository scoreRecordRepository) {
        this.categoryRepository = categoryRepository;
        this.scoreRecordRepository = scoreRecordRepository;
    }

    /**
     * 获取家庭的所有自定义维度
     */
    public List<CustomScoreCategory> getCategoriesByFamily(UUID familyId) {
        return categoryRepository.findByFamilyIdOrderByCreatedAtAsc(familyId);
    }

    /**
     * 创建自定义维度
     */
    @Transactional
    public CustomScoreCategory createCategory(UUID familyId, String name, String icon) {
        // 检查名称是否重复
        if (categoryRepository.findByFamilyIdAndName(familyId, name).isPresent()) {
            throw new BusinessException(ErrorMessages.CUSTOM_CATEGORY_NAME_DUPLICATED.format(name));
        }

        CustomScoreCategory category = new CustomScoreCategory();
        category.setFamilyId(familyId);
        category.setName(name);
        category.setIcon(icon);

        return categoryRepository.save(category);
    }

    /**
     * 删除自定义维度
     * 如果该维度有关联的积分记录，会一并删除（数据库设置为 ON DELETE SET NULL）
     */
    @Transactional
    public void deleteCategory(UUID familyId, UUID categoryId) {
        CustomScoreCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorMessages.CUSTOM_CATEGORY_NOT_FOUND.getMessage()));

        // 验证维度属于该家庭
        if (!category.getFamilyId().equals(familyId)) {
            throw new BusinessException(ErrorMessages.UNAUTHORIZED_OPERATION.getMessage());
        }

        // 检查是否有关联的积分记录
        long scoreCount = scoreRecordRepository.countByCustomCategoryId(categoryId);

        if (scoreCount > 0) {
            throw new BusinessException(ErrorMessages.CUSTOM_CATEGORY_HAS_SCORES.format(scoreCount));
        }

        categoryRepository.delete(category);
    }

    /**
     * 更新自定义维度
     */
    @Transactional
    public CustomScoreCategory updateCategory(UUID familyId, UUID categoryId, String name, String icon) {
        CustomScoreCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorMessages.CUSTOM_CATEGORY_NOT_FOUND.getMessage()));

        // 验证维度属于该家庭
        if (!category.getFamilyId().equals(familyId)) {
            throw new BusinessException(ErrorMessages.UNAUTHORIZED_OPERATION.getMessage());
        }

        // 如果修改了名称，检查是否与其他维度重复
        if (!category.getName().equals(name)) {
            categoryRepository.findByFamilyIdAndName(familyId, name).ifPresent(existing -> {
                if (!existing.getId().equals(categoryId)) {
                    throw new BusinessException(ErrorMessages.CUSTOM_CATEGORY_NAME_DUPLICATED.format(name));
                }
            });
            category.setName(name);
        }

        if (icon != null && !icon.isBlank()) {
            category.setIcon(icon);
        }

        return categoryRepository.save(category);
    }
}
