package com.seaworld.controller;

import com.seaworld.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest extends BaseIntegrationTest {

    @Test
    void register_ShouldCreateUserAndFamily() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@test.com");
        request.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        // Verify user was created
        assertTrue(userRepository.findByEmail("newuser@test.com").isPresent());
        var user = userRepository.findByEmail("newuser@test.com").get();
        assertEquals("parent", user.getRole());
        assertFalse(user.getEmailVerified());

        // Verify family was auto-created
        var members = familyMemberRepository.findByUserId(user.getId());
        assertFalse(members.isEmpty());
        assertEquals("owner", members.get(0).getRole());
    }

    @Test
    void register_WithDuplicateEmail_ShouldReturnError() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("parent@test.com"); // Already exists from base setup
        request.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("该邮箱已被注册"));
    }

    @Test
    void register_WithWeakPassword_ShouldReturnValidationError() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("weak@test.com");
        request.setPassword("123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnError() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_WithEmptyFields_ShouldReturnValidationError() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void verifyEmail_WithInvalidToken_ShouldReturnError() throws Exception {
        mockMvc.perform(post("/api/auth/verify-email")
                        .param("token", "invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void oauthLogin_WithUnsupportedProvider_ShouldReturnError() throws Exception {
        OAuthLoginRequest request = new OAuthLoginRequest();
        request.setProvider("wechat");
        request.setCode("test-code");

        mockMvc.perform(post("/api/auth/oauth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().is5xxServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void refreshToken_WithInvalidToken_ShouldReturnError() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("invalid-refresh-token");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void forgotPassword_WithValidEmail_ShouldReturnOk() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("parent@test.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void forgotPassword_WithInvalidEmail_ShouldReturnError() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexistent@test.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void resendVerification_WithAlreadyVerifiedEmail_ShouldReturnError() throws Exception {
        // parent@test.com already has emailVerified=true
        mockMvc.perform(post("/api/auth/resend-verification")
                        .param("email", "parent@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("邮箱已验证，无需重复验证"));
    }

    @Test
    void resendVerification_WithInvalidEmail_ShouldReturnError() throws Exception {
        mockMvc.perform(post("/api/auth/resend-verification")
                        .param("email", "nonexistent@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void resendVerification_WithUnverifiedEmail_ShouldReturnOk() throws Exception {
        // Register a new user first to get an unverified email
        RegisterRequest regRequest = new RegisterRequest();
        regRequest.setEmail("unverified@test.com");
        regRequest.setPassword("Password123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(regRequest)))
                .andExpect(status().isOk());

        // Now resend verification for this unverified email
        mockMvc.perform(post("/api/auth/resend-verification")
                        .param("email", "unverified@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
