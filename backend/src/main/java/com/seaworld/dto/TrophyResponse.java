package com.seaworld.dto;

import com.seaworld.entity.Trophy;

import java.time.LocalDateTime;

public record TrophyResponse(
        String id,
        String childId,
        String taskId,
        String name,
        int points,
        String icon,
        LocalDateTime earnedAt
) {
    public static TrophyResponse from(Trophy t) {
        return new TrophyResponse(
                t.getId().toString(),
                t.getChildId().toString(),
                t.getTaskId() != null ? t.getTaskId().toString() : null,
                t.getName(),
                t.getPoints(),
                t.getIcon(),
                t.getEarnedAt()
        );
    }
}
