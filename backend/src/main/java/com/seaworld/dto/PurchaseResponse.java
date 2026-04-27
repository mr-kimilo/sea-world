package com.seaworld.dto;

import com.seaworld.entity.PurchaseRecord;

import java.time.LocalDateTime;

public record PurchaseResponse(
        String id,
        String childId,
        String itemId,
        int cost,
        LocalDateTime purchasedAt
) {
    public static PurchaseResponse from(PurchaseRecord record) {
        return new PurchaseResponse(
                record.getId().toString(),
                record.getChildId().toString(),
                record.getItemId().toString(),
                record.getCost(),
                record.getPurchasedAt()
        );
    }
}
