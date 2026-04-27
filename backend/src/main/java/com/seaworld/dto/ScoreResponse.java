package com.seaworld.dto;

import com.seaworld.entity.ScoreRecord;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record ScoreResponse(
        String id,
        String childId,
        String operatorId,
        int score,
        String category,
        String customCategoryId,
        String customCategoryName,
        String customCategoryIcon,
        String reason,
        LocalDate recordDate,
        LocalDateTime createdAt
) {
    public static ScoreResponse from(ScoreRecord record) {
        return from(record, Map.of());
    }

    public static ScoreResponse from(ScoreRecord record, Map<UUID, com.seaworld.entity.CustomScoreCategory> customById) {
        UUID customId = record.getCustomCategoryId();
        com.seaworld.entity.CustomScoreCategory custom = (customId != null) ? customById.get(customId) : null;
        return new ScoreResponse(
                record.getId().toString(),
                record.getChildId().toString(),
                record.getOperatorId().toString(),
                record.getScore(),
                record.getCategory().name(),
                customId != null ? customId.toString() : null,
                custom != null ? custom.getName() : null,
                custom != null ? custom.getIcon() : null,
                record.getReason(),
                record.getRecordDate(),
                record.getCreatedAt()
        );
    }
}
