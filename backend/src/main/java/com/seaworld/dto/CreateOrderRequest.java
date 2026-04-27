package com.seaworld.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * 下单请求（重构后支持订单状态）
 */
public record CreateOrderRequest(
        @NotNull(message = "Item ID is required")
        UUID itemId
) {
}
