package com.seaworld.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValueItemResponse {
    private String id;
    private String name;
    private double price;
    private String unit;
    private String icon;
    private String category;
}
