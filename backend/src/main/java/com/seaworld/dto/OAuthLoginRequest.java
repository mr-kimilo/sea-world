package com.seaworld.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {
    @NotBlank
    private String provider;

    @NotBlank
    private String code;

    private String redirectUri;
}
