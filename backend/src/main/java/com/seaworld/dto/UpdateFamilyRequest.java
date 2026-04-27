package com.seaworld.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateFamilyRequest {

    @NotBlank(message = "家庭名字不能为空")
    @Size(max = 50, message = "家庭名字长度不能超过50个字符")
    private String name;
}
