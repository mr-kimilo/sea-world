package com.seaworld.dto;

import com.seaworld.entity.Family;

import java.time.LocalDateTime;
import java.util.UUID;

public record FamilyResponse(
        String id,
        String name,
        String createdBy,
        LocalDateTime createdAt
) {
    public static FamilyResponse from(Family family) {
        return new FamilyResponse(
                family.getId().toString(),
                family.getName(),
                family.getCreatedBy().toString(),
                family.getCreatedAt()
        );
    }
}
