package com.seaworld.service;

import com.seaworld.dto.AuthResponse;
import com.seaworld.dto.LoginRequest;
import com.seaworld.dto.RegisterRequest;
import com.seaworld.entity.DailyRegisterCount;
import com.seaworld.entity.Family;
import com.seaworld.entity.FamilyMember;
import com.seaworld.entity.RefreshToken;
import com.seaworld.entity.User;
import com.seaworld.exception.BusinessException;
import com.seaworld.repository.DailyRegisterCountRepository;
import com.seaworld.repository.FamilyMemberRepository;
import com.seaworld.repository.FamilyRepository;
import com.seaworld.repository.RefreshTokenRepository;
import com.seaworld.repository.UserRepository;
import com.seaworld.security.JwtTokenProvider;
import com.seaworld.util.ErrorMessages;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final DailyRegisterCountRepository dailyRegisterCountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Value("${app.security.max-daily-registrations}")
    private int maxDailyRegistrations;

    @Value("${app.security.email-verification-expiry-hours}")
    private int emailVerificationExpiryHours;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       FamilyRepository familyRepository,
                       FamilyMemberRepository familyMemberRepository,
                       DailyRegisterCountRepository dailyRegisterCountRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.dailyRegisterCountRepository = dailyRegisterCountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        // 检查邮箱唯一性
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorMessages.EMAIL_ALREADY_REGISTERED.getMessage());
        }

        // 检查每日注册上限
        LocalDate today = LocalDate.now();
        DailyRegisterCount dailyCount = dailyRegisterCountRepository.findById(today)
                .orElse(DailyRegisterCount.builder().registerDate(today).count(0).build());

        if (dailyCount.getCount() >= maxDailyRegistrations) {
            throw new BusinessException(ErrorMessages.DAILY_REGISTRATION_LIMIT.getMessage(), HttpStatus.TOO_MANY_REQUESTS);
        }

        // 创建用户
        String verifyToken = UUID.randomUUID().toString();
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("parent")
                .emailVerified(false)
                .emailVerifyToken(verifyToken)
                .emailVerifyExpire(LocalDateTime.now().plusHours(emailVerificationExpiryHours))
                .build();

        user = userRepository.save(user);

        // 自动创建默认家庭
        Family family = Family.builder()
                .name(request.getEmail() + "的家庭")
                .createdBy(user.getId())
                .build();
        family = familyRepository.save(family);

        // 将用户添加为家庭成员（owner角色）
        FamilyMember member = FamilyMember.builder()
                .familyId(family.getId())
                .userId(user.getId())
                .role("owner")
                .build();
        familyMemberRepository.save(member);

        // 更新每日注册计数
        dailyCount.setCount(dailyCount.getCount() + 1);
        dailyRegisterCountRepository.save(dailyCount);

        // 发送验证邮件
        emailService.sendVerificationEmail(user.getEmail(), verifyToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorMessages.INVALID_EMAIL_OR_PASSWORD.getMessage(), HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorMessages.INVALID_EMAIL_OR_PASSWORD.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        if (!user.getEmailVerified()) {
            throw new BusinessException(ErrorMessages.EMAIL_NOT_VERIFIED.getMessage(), HttpStatus.FORBIDDEN);
        }

        return generateTokens(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new BusinessException(ErrorMessages.INVALID_REFRESH_TOKEN.getMessage(), HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new BusinessException(ErrorMessages.REFRESH_TOKEN_EXPIRED.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorMessages.USER_NOT_FOUND.getMessage(), HttpStatus.UNAUTHORIZED));

        // 删除旧的 refresh token
        refreshTokenRepository.delete(refreshToken);

        return generateTokens(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerifyToken(token)
                .orElseThrow(() -> new BusinessException(ErrorMessages.INVALID_VERIFY_LINK.getMessage()));

        if (user.getEmailVerifyExpire().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorMessages.VERIFY_LINK_EXPIRED.getMessage());
        }

        user.setEmailVerified(true);
        user.setEmailVerifyToken(null);
        user.setEmailVerifyExpire(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorMessages.USER_NOT_FOUND.getMessage()));

        if (user.getEmailVerified()) {
            throw new BusinessException(ErrorMessages.EMAIL_ALREADY_VERIFIED.getMessage());
        }

        String verifyToken = UUID.randomUUID().toString();
        user.setEmailVerifyToken(verifyToken);
        user.setEmailVerifyExpire(LocalDateTime.now().plusHours(emailVerificationExpiryHours));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verifyToken);
    }

    private AuthResponse generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getId());

        // 保存 refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(jwtTokenProvider.getRefreshTokenExpiration())))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .nickname(user.getNickname())
                        .role(user.getRole())
                        .emailVerified(user.getEmailVerified())
                        .build())
                .build();
    }
}
