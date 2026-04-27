package com.seaworld.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 创建自定义积分维度请求
 */
public class CreateCustomCategoryRequest {

    @NotBlank(message = "维度名称不能为空")
    @Size(max = 100, message = "维度名称不能超过100个字符")
    private String name;

    @NotBlank(message = "维度图标不能为空")
    @Size(max = 50, message = "维度图标不能超过50个字符")
    private String icon;

    // Getters and Setters

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
