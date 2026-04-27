package com.seaworld.controller;

import com.seaworld.dto.ApiResponse;
import com.seaworld.dto.CreateProductRequest;
import com.seaworld.dto.ProductDetailResponse;
import com.seaworld.dto.ShopItemResponse;
import com.seaworld.dto.UpdateProductRequest;
import com.seaworld.service.ProductService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 商品管理 Controller（管理员功能）
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
public class ProductController {

    private final ProductService productService;

    /**
     * 创建商品
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDetailResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductDetailResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ResponseMessages.PRODUCT_CREATED.getMessage(), response));
    }

    /**
     * 更新商品
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductDetailResponse response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.PRODUCT_UPDATED.getMessage(), response));
    }

    /**
     * 删除商品（软删除）
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.PRODUCT_DELETED.getMessage()));
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProduct(@PathVariable UUID productId) {
        ProductDetailResponse response = productService.getProductDetail(productId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 获取所有商品（包括已禁用的）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ShopItemResponse>>> getAllProducts() {
        List<ShopItemResponse> response = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
