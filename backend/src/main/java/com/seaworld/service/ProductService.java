package com.seaworld.service;

import com.seaworld.dto.CreateProductRequest;
import com.seaworld.dto.ProductDetailResponse;
import com.seaworld.dto.ShopItemResponse;
import com.seaworld.dto.UpdateProductRequest;
import com.seaworld.entity.ShopItem;
import com.seaworld.entity.ShopItemAllowedChild;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ShopItemAllowedChildRepository;
import com.seaworld.repository.ShopItemRepository;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 商品管理服务（管理员功能）
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ShopItemRepository shopItemRepository;
    private final ShopItemAllowedChildRepository allowedChildRepository;

    /**
     * 创建商品
     */
    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        ShopItem item = ShopItem.builder()
                .name(request.name())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .price(request.price())
                .rarity(request.rarity())
                .sortOrder(request.sortOrder())
                .isActive(true)
                .build();

        ShopItem saved = shopItemRepository.save(item);

        // 设置允许购买的孩子
        if (request.allowedChildIds() != null && !request.allowedChildIds().isEmpty()) {
            saveAllowedChildren(saved.getId(), request.allowedChildIds());
        }

        return getProductDetail(saved.getId());
    }

    /**
     * 更新商品
     */
    @Transactional
    public ProductDetailResponse updateProduct(UUID productId, UpdateProductRequest request) {
        ShopItem item = shopItemRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        // 使用 Optional 优化字段更新
        java.util.Optional.ofNullable(request.name()).ifPresent(item::setName);
        java.util.Optional.ofNullable(request.description()).ifPresent(item::setDescription);
        java.util.Optional.ofNullable(request.imageUrl()).ifPresent(item::setImageUrl);
        java.util.Optional.ofNullable(request.price()).ifPresent(item::setPrice);
        java.util.Optional.ofNullable(request.rarity()).ifPresent(item::setRarity);
        java.util.Optional.ofNullable(request.sortOrder()).ifPresent(item::setSortOrder);
        java.util.Optional.ofNullable(request.isActive()).ifPresent(item::setIsActive);

        shopItemRepository.save(item);

        // 更新允许购买的孩子列表
        java.util.Optional.ofNullable(request.allowedChildIds()).ifPresent(childIds -> {
            allowedChildRepository.deleteByShopItemId(productId);
            if (!childIds.isEmpty()) {
                saveAllowedChildren(productId, childIds);
            }
        });

        return getProductDetail(productId);
    }

    /**
     * 删除商品（软删除：设置为不可用）
     */
    @Transactional
    public void deleteProduct(UUID productId) {
        ShopItem item = shopItemRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        item.setIsActive(false);
        shopItemRepository.save(item);
    }

    /**
     * 获取商品详情（包含允许购买的孩子列表）
     */
    public ProductDetailResponse getProductDetail(UUID productId) {
        ShopItem item = shopItemRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        List<String> allowedChildIds = allowedChildRepository.findByShopItemId(productId).stream()
                .map(ac -> ac.getChildId().toString())
                .toList();

        return ProductDetailResponse.from(item, allowedChildIds);
    }

    /**
     * 获取所有商品（包括已禁用的，管理员视角）
     */
    public List<ShopItemResponse> getAllProducts() {
        return shopItemRepository.findAll().stream()
                .map(ShopItemResponse::from)
                .toList();
    }

    /**
     * 保存允许购买的孩子列表
     */
    private void saveAllowedChildren(UUID shopItemId, List<UUID> childIds) {
        List<ShopItemAllowedChild> allowed = childIds.stream()
                .map(childId -> ShopItemAllowedChild.builder()
                        .shopItemId(shopItemId)
                        .childId(childId)
                        .build())
                .toList();
        allowedChildRepository.saveAll(allowed);
    }
}
