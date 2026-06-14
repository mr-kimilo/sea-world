package com.seaworld.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ChildTaskRequest {
    @NotBlank
    private String name;

    private String description;

    @PositiveOrZero
    private int points = 5;

    private String icon = "📋";

    private String trophyName;

    private String dimension;

    private String childId;
}
