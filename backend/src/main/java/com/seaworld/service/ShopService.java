package com.seaworld.service;

import com.seaworld.dto.CreateOrderRequest;
import com.seaworld.dto.OrderResponse;
import com.seaworld.dto.ShopItemResponse;
import com.seaworld.entity.*;
import com.seaworld.exception.BusinessException;
import com.seaworld.exception.ForbiddenException;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.*;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 商城服务（用户购买、订单管理）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final ChildRepository childRepository;
    private final PurchaseRecordRepository purchaseRecordRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final ShopItemAllowedChildRepository allowedChildRepository;

    /**
     * 获取所有激活的商品列表（用户视角）
     */
    public List<ShopItemResponse> listActiveItems() {
        return shopItemRepository.findByIsActiveTrueOrderBySortOrder().stream()
                .map(ShopItemResponse::from)
                .toList();
    }

    /**
     * 获取某孩子可购买的商品列表（过滤限制）
     */
    public List<ShopItemResponse> listAvailableItemsForChild(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        return shopItemRepository.findByIsActiveTrueOrderBySortOrder().stream()
                .filter(item -> isItemAllowedForChild(item.getId(), childId))
                .map(ShopItemResponse::from)
                .toList();
    }

    /**
     * 创建订单（下单暂扣积分）
     */
    @Transactional
    public OrderResponse createOrder(User requester, UUID childId, CreateOrderRequest request) {
        log.info("🛒 [ShopService] createOrder 开始 - userId: {}, childId: {}, itemId: {}",
                requester.getId(), childId, request.itemId());

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        log.info("🛒 [ShopService] 找到孩子 - name: {}, availableScore: {}, totalScore: {}",
                child.getName(), child.getAvailableScore(), child.getTotalScore());

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        ShopItem item = shopItemRepository.findById(request.itemId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        log.info("🛒 [ShopService] 找到商品 - name: {}, price: {}, isActive: {}",
                item.getName(), item.getPrice(), item.getIsActive());

        // 检查商品是否激活
        if (!item.getIsActive()) {
            throw new BusinessException(ErrorMessages.ITEM_NOT_AVAILABLE.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // 检查孩子是否被允许购买此商品
        if (!isItemAllowedForChild(item.getId(), childId)) {
            throw new BusinessException(ErrorMessages.ITEM_NOT_ALLOWED_FOR_CHILD.getMessage(), HttpStatus.FORBIDDEN);
        }

        // 检查积分是否足够
        if (child.getAvailableScore() < item.getPrice()) {
            log.warn("⚠️ [ShopService] 积分不足 - available: {}, required: {}",
                    child.getAvailableScore(), item.getPrice());
            throw new BusinessException(ErrorMessages.INSUFFICIENT_SCORE.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // 扣除可用积分（totalScore是累计获得总分，不会因消费而减少）
        Integer oldAvailableScore = child.getAvailableScore();
        Integer newAvailableScore = oldAvailableScore - item.getPrice();
        log.info("🛒 [ShopService] 准备扣除可用积分 - oldAvailable: {}, price: {}, newAvailable: {}",
                oldAvailableScore, item.getPrice(), newAvailableScore);
        child.setAvailableScore(newAvailableScore);
        child = childRepository.save(child);
        log.info("🛒 [ShopService] 可用积分已扣除并保存 - 最新 availableScore: {}, totalScore: {}", 
                child.getAvailableScore(), child.getTotalScore());

        // 创建待确认订单
        PurchaseRecord order = PurchaseRecord.builder()
                .childId(childId)
                .itemId(item.getId())
                .cost(item.getPrice())
                .status(OrderStatus.PENDING)
                .build();
        order = purchaseRecordRepository.save(order);
        log.info("🛒 [ShopService] 订单已创建 - orderId: {}, status: {}", order.getId(), order.getStatus());

        OrderResponse response = OrderResponse.from(order, item.getName(), item.getImageUrl(), child.getAvailableScore(), child.getTotalScore());
        log.info("🛒 [ShopService] 返回响应 - updatedChildScore: {}", response.updatedChildScore());
        return response;
    }

    /**
     * 确认订单（真实扣除积分）
     */
    @Transactional
    public OrderResponse confirmOrder(User requester, UUID childId, UUID orderId) {
        PurchaseRecord order = purchaseRecordRepository.findByIdAndChildId(orderId, childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ORDER_NOT_FOUND.getMessage()));

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        // 检查订单状态
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new BusinessException(ErrorMessages.ORDER_ALREADY_COMPLETED.getMessage(), HttpStatus.CONFLICT);
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorMessages.ORDER_ALREADY_CANCELLED.getMessage(), HttpStatus.CONFLICT);
        }

        // 确认消费：扣除totalScore（availableScore已在购买时扣除）
        log.info("🛒 [ShopService] 确认订单 - orderId: {}, cost: {}, 当前 totalScore: {}, availableScore: {}",
                order.getId(), order.getCost(), child.getTotalScore(), child.getAvailableScore());
        
        child.setTotalScore(child.getTotalScore() - order.getCost());
        child = childRepository.save(child);
        
        log.info("🛒 [ShopService] 订单确认后 - 更新后 totalScore: {}, availableScore: {}",
                child.getTotalScore(), child.getAvailableScore());

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        purchaseRecordRepository.save(order);

        ShopItem item = shopItemRepository.findById(order.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        return OrderResponse.from(order, item.getName(), item.getImageUrl(), child.getAvailableScore(), child.getTotalScore());
    }

    /**
     * 取消订单（返还积分）
     */
    @Transactional
    public OrderResponse cancelOrder(User requester, UUID childId, UUID orderId) {
        PurchaseRecord order = purchaseRecordRepository.findByIdAndChildId(orderId, childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ORDER_NOT_FOUND.getMessage()));

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        // 检查订单状态
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new BusinessException(ErrorMessages.CANNOT_CANCEL_COMPLETED_ORDER.getMessage(), HttpStatus.CONFLICT);
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorMessages.ORDER_ALREADY_CANCELLED.getMessage(), HttpStatus.CONFLICT);
        }

        // 返还可用积分（totalScore保持不变）
        log.info("🛒 [ShopService] 取消订单 - orderId: {}, cost: {}, 当前 totalScore: {}, availableScore: {}",
                order.getId(), order.getCost(), child.getTotalScore(), child.getAvailableScore());
        
        child.setAvailableScore(child.getAvailableScore() + order.getCost());
        child = childRepository.save(child);
        
        log.info("🛒 [ShopService] 订单取消后 - totalScore 保持: {}, availableScore 返还后: {}",
                child.getTotalScore(), child.getAvailableScore());

        // 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        purchaseRecordRepository.save(order);

        ShopItem item = shopItemRepository.findById(order.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ITEM_NOT_FOUND.getMessage()));

        return OrderResponse.from(order, item.getName(), item.getImageUrl(), child.getAvailableScore(), child.getTotalScore());
    }

    /**
     * 获取某孩子的所有订单
     */
    public List<OrderResponse> getOrders(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        return purchaseRecordRepository.findByChildIdOrderByPurchasedAtDesc(childId).stream()
                .map(order -> {
                    ShopItem item = shopItemRepository.findById(order.getItemId()).orElse(null);
                    String itemName = item != null ? item.getName() : "Unknown";
                    String itemImageUrl = item != null ? item.getImageUrl() : null;
                    return OrderResponse.from(order, itemName, itemImageUrl);
                })
                .toList();
    }

    /**
     * 获取某孩子的待确认订单
     */
    public List<OrderResponse> getPendingOrders(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        return purchaseRecordRepository.findPendingOrdersByChildId(childId).stream()
                .map(order -> {
                    ShopItem item = shopItemRepository.findById(order.getItemId()).orElse(null);
                    String itemName = item != null ? item.getName() : "Unknown";
                    String itemImageUrl = item != null ? item.getImageUrl() : null;
                    return OrderResponse.from(order, itemName, itemImageUrl);
                })
                .toList();
    }

    /**
     * 获取某孩子的已完成订单
     */
    public List<OrderResponse> getCompletedOrders(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));

        requireFamilyAccess(requester.getId(), child.getFamilyId());

        return purchaseRecordRepository.findCompletedOrdersByChildId(childId).stream()
                .map(order -> {
                    ShopItem item = shopItemRepository.findById(order.getItemId()).orElse(null);
                    String itemName = item != null ? item.getName() : "Unknown";
                    String itemImageUrl = item != null ? item.getImageUrl() : null;
                    return OrderResponse.from(order, itemName, itemImageUrl);
                })
                .toList();
    }

    // ---- helpers ----

    private void requireFamilyAccess(UUID userId, UUID familyId) {
        if (!familyMemberRepository.existsByFamilyIdAndUserId(familyId, userId)) {
            throw new ForbiddenException(ErrorMessages.NO_ACCESS_TO_CHILD.getMessage());
        }
    }

    /**
     * 检查某商品是否允许某孩子购买
     * 规则：无限制记录 = 所有孩子可买；有限制记录 = 仅限记录中的孩子
     */
    private boolean isItemAllowedForChild(UUID shopItemId, UUID childId) {
        long count = allowedChildRepository.countByShopItemId(shopItemId);
        if (count == 0) {
            // 无限制，所有孩子可买
            return true;
        }
        // 有限制，检查是否在允许列表中
        return allowedChildRepository.existsByShopItemIdAndChildId(shopItemId, childId);
    }
}
