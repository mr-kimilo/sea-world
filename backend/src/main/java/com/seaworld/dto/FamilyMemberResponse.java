package com.seaworld.dto;

import com.seaworld.entity.FamilyMember;

import java.time.LocalDateTime;

public record FamilyMemberResponse(
        String id,
        String familyId,
        String userId,
        String userEmail,
        String role,
        String status,
        LocalDateTime joinedAt
) {
    public static FamilyMemberResponse from(FamilyMember m, String userEmail) {
        return new FamilyMemberResponse(
                m.getId().toString(),
                m.getFamilyId().toString(),
                m.getUserId().toString(),
                userEmail,
                m.getRole(),
                m.getStatus(),
                m.getJoinedAt()
        );
    }
}
