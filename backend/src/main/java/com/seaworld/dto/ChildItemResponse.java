package com.seaworld.dto;

import com.seaworld.entity.ChildItem;

import java.time.LocalDateTime;

public record ChildItemResponse(
        String id,
        String childId,
        String itemId,
        String nickname,
        boolean isFavorite,
        LocalDateTime acquiredAt
) {
    public static ChildItemResponse from(ChildItem item) {
        return new ChildItemResponse(
                item.getId().toString(),
                item.getChildId().toString(),
                item.getItemId().toString(),
                item.getNickname(),
                Boolean.TRUE.equals(item.getIsFavorite()),
                item.getAcquiredAt()
        );
    }
}
