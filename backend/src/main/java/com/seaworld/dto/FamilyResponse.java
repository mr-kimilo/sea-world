package com.seaworld.dto;

import com.seaworld.entity.Family;

import java.time.LocalDateTime;

public record FamilyResponse(
        String id,
        String name,
        String createdBy,
        String shareCode,
        String description,
        LocalDateTime createdAt
) {
    public static FamilyResponse from(Family family) {
        return new FamilyResponse(
                family.getId().toString(),
                family.getName(),
                family.getCreatedBy().toString(),
                family.getShareCode(),
                family.getDescription(),
                family.getCreatedAt()
        );
    }
}
