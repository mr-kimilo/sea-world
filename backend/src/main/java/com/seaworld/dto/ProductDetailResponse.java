package com.seaworld.dto;

import com.seaworld.entity.ShopItem;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品详情响应（包含允许购买的孩子列表）
 */
public record ProductDetailResponse(
        String id,
        String name,
        String description,
        String imageUrl,
        int price,
        String rarity,
        int sortOrder,
        boolean isActive,
        LocalDateTime createdAt,
        List<String> allowedChildIds  // 空列表 = 所有孩子可买
) {
    public static ProductDetailResponse from(ShopItem item, List<String> allowedChildIds) {
        return new ProductDetailResponse(
                item.getId().toString(),
                item.getName(),
                item.getDescription(),
                item.getImageUrl(),
                item.getPrice(),
                item.getRarity(),
                item.getSortOrder(),
                item.getIsActive(),
                item.getCreatedAt(),
                allowedChildIds
        );
    }
}
