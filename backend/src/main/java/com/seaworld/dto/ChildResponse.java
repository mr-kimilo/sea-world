package com.seaworld.dto;

import com.seaworld.entity.Child;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ChildResponse(
        String id,
        String familyId,
        String name,
        String nickname,
        String avatarUrl,
        LocalDate birthDate,
        int totalScore,
        int availableScore,
        LocalDateTime createdAt
) {
    public static ChildResponse from(Child child) {
        return new ChildResponse(
                child.getId().toString(),
                child.getFamilyId().toString(),
                child.getName(),
                child.getNickname(),
                child.getAvatarUrl(),
                child.getBirthDate(),
                child.getTotalScore(),
                child.getAvailableScore(),
                child.getCreatedAt()
        );
    }
}
