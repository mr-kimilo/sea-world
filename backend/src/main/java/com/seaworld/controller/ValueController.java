package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.service.ValueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/value")
public class ValueController {

    private final ValueService valueService;

    public ValueController(ValueService valueService) {
        this.valueService = valueService;
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<ValueCategoriesResponse>> getCategories() {
        List<String> cats = valueService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok(new ValueCategoriesResponse(cats)));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<ValueItemResponse>>> getItems(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "5") int age) {
        List<ValueItemResponse> items = valueService.getItems(category, age);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<ValueCalculateResponse>> calculate(
            @RequestParam double amount,
            @RequestParam String itemId) {
        ValueCalculateResponse result = valueService.calculate(amount, itemId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
