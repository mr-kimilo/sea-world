package com.seaworld.dto;

import com.seaworld.entity.OrderStatus;
import com.seaworld.entity.PurchaseRecord;

import java.time.LocalDateTime;

/**
 * 订单响应DTO
 */
public record OrderResponse(
        String id,
        String childId,
        String itemId,
        String itemName,      // 商品名称（关联查询）
        String itemImageUrl,  // 商品图片（关联查询）
        int cost,
        String status,        // PENDING / COMPLETED / CANCELLED
        LocalDateTime purchasedAt,
        LocalDateTime completedAt,
        ChildScoreSnapshot updatedChildScore  // 操作后更新的孩子积分（可选）
) {
    /**
     * 孩子积分快照（用于订单操作后返回更新的积分）
     */
    public record ChildScoreSnapshot(
            int available,
            int total
    ) {}

    public static OrderResponse from(PurchaseRecord record, String itemName, String itemImageUrl) {
        return new OrderResponse(
                record.getId().toString(),
                record.getChildId().toString(),
                record.getItemId().toString(),
                itemName,
                itemImageUrl,
                record.getCost(),
                record.getStatus().name(),
                record.getPurchasedAt(),
                record.getCompletedAt(),
                null  // 默认不返回积分
        );
    }

    public static OrderResponse from(PurchaseRecord record, String itemName, String itemImageUrl, Integer childAvailableScore, Integer childTotalScore) {
        return new OrderResponse(
                record.getId().toString(),
                record.getChildId().toString(),
                record.getItemId().toString(),
                itemName,
                itemImageUrl,
                record.getCost(),
                record.getStatus().name(),
                record.getPurchasedAt(),
                record.getCompletedAt(),
                new ChildScoreSnapshot(childAvailableScore, childTotalScore)
        );
    }
}
