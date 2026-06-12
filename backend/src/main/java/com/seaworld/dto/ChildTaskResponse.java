package com.seaworld.dto;

import com.seaworld.entity.ChildTask;

import java.time.LocalDateTime;

public record ChildTaskResponse(
        String id,
        String childId,
        String familyId,
        String createdBy,
        String name,
        String description,
        int points,
        String icon,
        String trophyName,
        String status,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ChildTaskResponse from(ChildTask t) {
        return new ChildTaskResponse(
                t.getId().toString(),
                t.getChildId().toString(),
                t.getFamilyId().toString(),
                t.getCreatedBy().toString(),
                t.getName(),
                t.getDescription(),
                t.getPoints(),
                t.getIcon(),
                t.getTrophyName(),
                t.getStatus(),
                t.getCompletedAt(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
