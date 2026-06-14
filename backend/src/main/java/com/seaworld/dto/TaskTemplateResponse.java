package com.seaworld.dto;

import com.seaworld.entity.TaskTemplate;

import java.time.LocalDateTime;

public record TaskTemplateResponse(
        String id,
        String grade,
        String name,
        String description,
        int points,
        String icon,
        String trophyName,
        String dimension,
        int sortOrder,
        LocalDateTime createdAt
) {
    public static TaskTemplateResponse from(TaskTemplate t) {
        return new TaskTemplateResponse(
                t.getId().toString(),
                t.getGrade(),
                t.getName(),
                t.getDescription(),
                t.getPoints(),
                t.getIcon(),
                t.getTrophyName(),
                t.getDimension(),
                t.getSortOrder(),
                t.getCreatedAt()
        );
    }
}
