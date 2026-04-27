package com.seaworld.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 自定义积分维度响应
 */
public class CustomCategoryResponse {

    private UUID id;
    private UUID familyId;
    private String name;
    private String icon;
    private LocalDateTime createdAt;
    private Long scoreCount; // 使用该维度的积分记录数量

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFamilyId() {
        return familyId;
    }

    public void setFamilyId(UUID familyId) {
        this.familyId = familyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getScoreCount() {
        return scoreCount;
    }

    public void setScoreCount(Long scoreCount) {
        this.scoreCount = scoreCount;
    }

    /**
     * 从实体创建响应对象（工厂方法）
     */
    public static CustomCategoryResponse fromEntity(com.seaworld.entity.CustomScoreCategory entity, Long scoreCount) {
        CustomCategoryResponse response = new CustomCategoryResponse();
        response.setId(entity.getId());
        response.setFamilyId(entity.getFamilyId());
        response.setName(entity.getName());
        response.setIcon(entity.getIcon());
        response.setCreatedAt(entity.getCreatedAt());
        response.setScoreCount(scoreCount != null ? scoreCount : 0L);
        return response;
    }
}
