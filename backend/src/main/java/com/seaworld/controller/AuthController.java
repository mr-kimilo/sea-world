package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.service.AuthService;
import com.seaworld.util.ResponseMessages;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.REGISTER_SUCCESS.getMessage()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.LOGIN_SUCCESS.getMessage(), response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.TOKEN_REFRESHED.getMessage(), response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam @NotBlank String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.EMAIL_VERIFIED.getMessage()));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @RequestParam @NotBlank @Email String email) {
        authService.resendVerification(email);
        return ResponseEntity.ok(ApiResponse.ok(ResponseMessages.VERIFICATION_RESENT.getMessage()));
    }
}
