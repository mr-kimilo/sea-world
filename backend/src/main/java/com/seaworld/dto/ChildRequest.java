package com.seaworld.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ChildRequest {

    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 50)
    private String nickname;

    @Size(max = 500)
    private String avatarUrl;

    private LocalDate birthDate;
}
