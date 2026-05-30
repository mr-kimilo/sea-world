package com.seaworld.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValueCalculateResponse {
    private boolean tooExpensive;
    private String name;
    private double price;
    private String unit;
    private String icon;
    private double amount;
    private int count;
    private double remainder;
    private String voiceText;
    private boolean useStack;
}
