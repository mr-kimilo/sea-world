package com.seaworld.controller;

import com.seaworld.dto.ApiResponse;
import com.seaworld.dto.CreateOrderRequest;
import com.seaworld.dto.OrderResponse;
import com.seaworld.dto.ShopItemResponse;
import com.seaworld.entity.User;
import com.seaworld.service.ShopService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 商城 Controller（用户购买、订单管理）
 */
@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
@Validated
public class ShopController {

    private final ShopService shopService;

    /**
     * 获取所有激活的商品列表
     */
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<ShopItemResponse>>> listItems() {
        List<ShopItemResponse> items = shopService.listActiveItems();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    /**
     * 获取某孩子可购买的商品列表（过滤限制）
     */
    @GetMapping("/children/{childId}/available-items")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ShopItemResponse>>> listAvailableItems(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<ShopItemResponse> items = shopService.listAvailableItemsForChild(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    /**
     * 创建订单（下单暂扣积分）
     */
    @PostMapping("/children/{childId}/orders")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = shopService.createOrder(currentUser, childId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ResponseMessages.PURCHASE_SUCCESS.getMessage(), response));
    }

    /**
     * 确认订单（真实扣除积分）
     */
    @PostMapping("/children/{childId}/orders/{orderId}/confirm")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId,
            @PathVariable UUID orderId) {
        OrderResponse response = shopService.confirmOrder(currentUser, childId, orderId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.ORDER_CONFIRMED.getMessage(), response));
    }

    /**
     * 取消订单（返还积分）
     */
    @PostMapping("/children/{childId}/orders/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId,
            @PathVariable UUID orderId) {
        OrderResponse response = shopService.cancelOrder(currentUser, childId, orderId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.ORDER_CANCELLED.getMessage(), response));
    }

    /**
     * 获取某孩子的所有订单
     */
    @GetMapping("/children/{childId}/orders")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<OrderResponse> orders = shopService.getOrders(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    /**
     * 获取某孩子的待确认订单
     */
    @GetMapping("/children/{childId}/orders/pending")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPendingOrders(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<OrderResponse> orders = shopService.getPendingOrders(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    /**
     * 获取某孩子的已完成订单
     */
    @GetMapping("/children/{childId}/orders/completed")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCompletedOrders(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID childId) {
        List<OrderResponse> orders = shopService.getCompletedOrders(currentUser, childId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }
}
