package com.seaworld.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * 更新商品请求
 */
public record UpdateProductRequest(
        @Size(max = 100, message = "Product name must not exceed 100 characters")
        String name,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl,

        @Min(value = 0, message = "Price must be non-negative")
        Integer price,

        String rarity,

        Integer sortOrder,

        Boolean isActive,

        /**
         * 允许购买的孩子ID列表
         * null = 不修改现有设置
         * 空列表 = 清空限制（所有孩子可买）
         * 非空列表 = 替换为新的限制列表
         */
        List<UUID> allowedChildIds
) {
}
