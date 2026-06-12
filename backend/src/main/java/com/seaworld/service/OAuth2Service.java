package com.seaworld.service;

import com.seaworld.dto.AuthResponse;
import com.seaworld.dto.OAuthLoginRequest;
import com.seaworld.entity.Family;
import com.seaworld.entity.FamilyMember;
import com.seaworld.entity.User;
import com.seaworld.exception.BusinessException;
import com.seaworld.repository.FamilyMemberRepository;
import com.seaworld.repository.FamilyRepository;
import com.seaworld.repository.UserRepository;
import com.seaworld.security.JwtTokenProvider;
import com.seaworld.util.ErrorMessages;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OAuth2Service {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${app.oauth.qq.client-id:}")
    private String qqClientId;

    @Value("${app.oauth.qq.client-secret:}")
    private String qqClientSecret;

    @Value("${app.oauth.douyin.client-id:}")
    private String douyinClientId;

    @Value("${app.oauth.douyin.client-secret:}")
    private String douyinClientSecret;

    public OAuth2Service(UserRepository userRepository,
                         FamilyRepository familyRepository,
                         FamilyMemberRepository familyMemberRepository,
                         JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public AuthResponse login(OAuthLoginRequest request) {
        String provider = request.getProvider().toLowerCase();

        // Exchange code for access token
        Map<String, Object> tokenResponse = exchangeCodeForToken(provider, request.getCode(), request.getRedirectUri());

        // Get user info from provider
        Map<String, Object> userInfo = getUserInfo(provider, tokenResponse);

        // Extract provider ID and email
        String providerId = extractProviderId(provider, userInfo);
        String email = extractEmail(provider, userInfo);
        String nickname = extractNickname(provider, userInfo);
        String avatarUrl = extractAvatarUrl(provider, userInfo);

        // Find or create user
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        User user = existingUser.orElseGet(() -> createOAuthUser(provider, providerId, email, nickname, avatarUrl));

        // Generate JWT
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(new AuthResponse.UserInfo(user.getId().toString(), user.getEmail(), user.getNickname(), user.getRole()))
                .build();
    }

    @Transactional
    public User createOAuthUser(String provider, String providerId, String email, String nickname, String avatarUrl) {
        User user = User.builder()
                .email(email != null ? email : provider + "_" + providerId + "@oauth.local")
                .password(UUID.randomUUID().toString()) // random password, not used
                .nickname(nickname)
                .avatarUrl(avatarUrl)
                .role("parent")
                .emailVerified(true)
                .provider(provider)
                .providerId(providerId)
                .build();
        user = userRepository.save(user);

        // Auto-create family
        Family family = Family.builder()
                .name(nickname != null ? nickname + "的家庭" : "我的家庭")
                .createdBy(user.getId())
                .build();
        family = familyRepository.save(family);

        FamilyMember member = FamilyMember.builder()
                .familyId(family.getId())
                .userId(user.getId())
                .role("owner")
                .status("ACTIVE")
                .build();
        familyMemberRepository.save(member);

        return user;
    }

    // ─── OAuth Provider Implementations ───

    private Map<String, Object> exchangeCodeForToken(String provider, String code, String redirectUri) {
        return switch (provider) {
            case "qq" -> exchangeQQCode(code, redirectUri);
            case "douyin" -> exchangeDouyinCode(code, redirectUri);
            default -> throw new BusinessException(ErrorMessages.UNSUPPORTED_OAUTH_PROVIDER.getMessage());
        };
    }

    private Map<String, Object> getUserInfo(String provider, Map<String, Object> tokenResponse) {
        String accessToken = (String) tokenResponse.get("access_token");
        return switch (provider) {
            case "qq" -> getQQUserInfo(accessToken);
            case "douyin" -> getDouyinUserInfo(accessToken);
            default -> throw new BusinessException(ErrorMessages.UNSUPPORTED_OAUTH_PROVIDER.getMessage());
        };
    }

    private Map<String, Object> exchangeQQCode(String code, String redirectUri) {
        try {
            String url = "https://graph.qq.com/oauth2.0/token?grant_type=authorization_code"
                    + "&client_id=" + qqClientId
                    + "&client_secret=" + qqClientSecret
                    + "&code=" + code
                    + "&redirect_uri=" + (redirectUri != null ? redirectUri : "");
            String response = restTemplate.getForObject(url, String.class);
            // Parse access_token from query string response
            if (response != null) {
                String[] params = response.split("&");
                for (String param : params) {
                    String[] parts = param.split("=");
                    if (parts.length == 2 && "access_token".equals(parts[0])) {
                        return Map.of("access_token", parts[1]);
                    }
                }
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorMessages.OAUTH_CODE_EXCHANGE_FAILED.getMessage());
        }
        throw new BusinessException(ErrorMessages.OAUTH_CODE_EXCHANGE_FAILED.getMessage());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getQQUserInfo(String accessToken) {
        try {
            // Get openid first
            String openIdUrl = "https://graph.qq.com/oauth2.0/me?access_token=" + accessToken;
            String openIdResponse = restTemplate.getForObject(openIdUrl, String.class);

            // Parse callback({ "openid": "..." }) format
            String openId = extractQQOpenId(openIdResponse);

            // Get user info
            String userInfoUrl = "https://graph.qq.com/user/get_user_info?access_token=" + accessToken
                    + "&oauth_consumer_key=" + qqClientId + "&openid=" + openId;
            Map<String, Object> userInfo = restTemplate.getForObject(userInfoUrl, Map.class);

            if (userInfo != null) {
                userInfo.put("openid", openId);
                return userInfo;
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorMessages.OAUTH_USER_INFO_FAILED.getMessage());
        }
        throw new BusinessException(ErrorMessages.OAUTH_USER_INFO_FAILED.getMessage());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeDouyinCode(String code, String redirectUri) {
        try {
            String url = "https://open.douyin.com/oauth/access_token/"
                    + "?client_key=" + douyinClientId
                    + "&client_secret=" + douyinClientSecret
                    + "&code=" + code
                    + "&grant_type=authorization_code";
            Map<String, Object> response = restTemplate.postForObject(url, null, Map.class);
            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                String accessToken = (String) data.get("access_token");
                if (accessToken != null) {
                    return Map.of("access_token", accessToken);
                }
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorMessages.OAUTH_CODE_EXCHANGE_FAILED.getMessage());
        }
        throw new BusinessException(ErrorMessages.OAUTH_CODE_EXCHANGE_FAILED.getMessage());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getDouyinUserInfo(String accessToken) {
        try {
            String url = "https://open.douyin.com/oauth/userinfo/?access_token=" + accessToken;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("data")) {
                return (Map<String, Object>) response.get("data");
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorMessages.OAUTH_USER_INFO_FAILED.getMessage());
        }
        throw new BusinessException(ErrorMessages.OAUTH_USER_INFO_FAILED.getMessage());
    }

    private String extractQQOpenId(String response) {
        if (response == null) return UUID.randomUUID().toString();
        // Format: callback( {"client_id":"xxx","openid":"xxx"} )
        try {
            int start = response.indexOf('{');
            int end = response.lastIndexOf('}');
            if (start >= 0 && end > start) {
                String json = response.substring(start, end + 1);
                // Simple JSON parse for openid
                int keyIdx = json.indexOf("\"openid\"");
                if (keyIdx >= 0) {
                    int valStart = json.indexOf('"', keyIdx + 8) + 1;
                    int valEnd = json.indexOf('"', valStart);
                    if (valStart > 0 && valEnd > valStart) {
                        return json.substring(valStart, valEnd);
                    }
                }
            }
        } catch (Exception ignored) {}
        return UUID.randomUUID().toString();
    }

    private String extractProviderId(String provider, Map<String, Object> userInfo) {
        return switch (provider) {
            case "qq" -> (String) userInfo.getOrDefault("openid", UUID.randomUUID().toString());
            case "douyin" -> (String) userInfo.getOrDefault("union_id",
                    userInfo.getOrDefault("open_id", UUID.randomUUID().toString()));
            default -> UUID.randomUUID().toString();
        };
    }

    private String extractEmail(String provider, Map<String, Object> userInfo) {
        return switch (provider) {
            case "qq" -> null; // QQ does not provide email
            case "douyin" -> (String) userInfo.get("email");
            default -> null;
        };
    }

    private String extractNickname(String provider, Map<String, Object> userInfo) {
        if (provider.equals("qq")) {
            return (String) userInfo.get("nickname");
        }
        return (String) userInfo.getOrDefault("nickname",
                userInfo.getOrDefault("display_name", "用户"));
    }

    private String extractAvatarUrl(String provider, Map<String, Object> userInfo) {
        if (provider.equals("qq")) {
            // QQ returns figureurl_qq_2 (100x100) or figureurl_qq_1 (50x50)
            String avatar = (String) userInfo.get("figureurl_qq_2");
            return avatar != null ? avatar : (String) userInfo.get("figureurl_qq_1");
        }
        return (String) userInfo.getOrDefault("avatar", null);
    }
}
