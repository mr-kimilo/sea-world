package com.seaworld.dto;

import com.seaworld.entity.ShopItem;

import java.time.LocalDateTime;

public record ShopItemResponse(
        String id,
        String name,
        String description,
        String imageUrl,
        int price,
        String rarity,
        int sortOrder,
        boolean isActive,
        LocalDateTime createdAt
) {
    public static ShopItemResponse from(ShopItem item) {
        return new ShopItemResponse(
                item.getId().toString(),
                item.getName(),
                item.getDescription(),
                item.getImageUrl(),
                item.getPrice(),
                item.getRarity(),
                item.getSortOrder(),
                item.getIsActive(),
                item.getCreatedAt()
        );
    }
}
