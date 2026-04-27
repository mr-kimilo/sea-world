package com.seaworld.dto;

import com.seaworld.entity.ScoreCategory;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

@Data
public class ScoreRequest {

    @NotNull
    @Min(-10)
    @Max(10)
    private Integer score;

    @NotNull
    private ScoreCategory category;

    /**
     * Optional custom category id.
     * When present, service will record category as ScoreCategory.custom
     * and store this id in score_records.custom_category_id.
     */
    private UUID customCategoryId;

    @NotBlank
    @Size(max = 200)
    private String reason;
}
