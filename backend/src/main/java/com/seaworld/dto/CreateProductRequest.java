package com.seaworld.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * 创建商品请求
 */
public record CreateProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 100, message = "Product name must not exceed 100 characters")
        String name,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @Size(max = 500, message = "Image URL must not exceed 500 characters")
        String imageUrl,

        @NotNull(message = "Price is required")
        @Min(value = 1, message = "Price must be at least 1")
        Integer price,

        @NotBlank(message = "Rarity is required")
        String rarity,

        @NotNull(message = "Sort order is required")
        Integer sortOrder,

        /**
         * 允许购买的孩子ID列表
         * null 或空列表 = 所有孩子都可以购买
         * 非空列表 = 仅限指定孩子购买
         */
        List<UUID> allowedChildIds
) {
}
