package com.seaworld.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seaworld.dto.*;
import com.seaworld.entity.*;
import com.seaworld.repository.*;
import com.seaworld.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected FamilyRepository familyRepository;

    @Autowired
    protected FamilyMemberRepository familyMemberRepository;

    @Autowired
    protected ChildRepository childRepository;

    @Autowired
    protected ChildTaskRepository childTaskRepository;

    @Autowired
    protected TaskTemplateRepository taskTemplateRepository;

    @Autowired
    protected TrophyRepository trophyRepository;

    @Autowired
    protected RefreshTokenRepository refreshTokenRepository;

    @Autowired
    protected JwtTokenProvider jwtTokenProvider;

    // Mock mail sender to avoid connection issues during tests
    @MockBean
    protected JavaMailSender mailSender;

    // Test data
    protected User testParent;
    protected Family testFamily;
    protected Child testChild;
    protected String parentAccessToken;

    @BeforeEach
    void setUpBase() {
        // Create test parent user with emailVerified=true
        testParent = userRepository.save(User.builder()
                .email("parent@test.com")
                .password("$2a$10$dummy-hash") // BCrypt hash placeholder (won't match any password)
                .nickname("Test Parent")
                .role("parent")
                .emailVerified(true)
                .build());

        // Create test family
        testFamily = familyRepository.save(Family.builder()
                .name("Test Family")
                .createdBy(testParent.getId())
                .shareCode("TEST123")
                .build());

        // Add parent as family member (owner)
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(testParent.getId())
                .role("owner")
                .status("ACTIVE")
                .build());

        // Create test child
        testChild = childRepository.save(Child.builder()
                .familyId(testFamily.getId())
                .name("Test Child")
                .nickname("Tester")
                .birthDate(LocalDate.of(2020, 1, 1))
                .totalScore(0)
                .availableScore(0)
                .build());

        // Generate JWT token for parent
        parentAccessToken = jwtTokenProvider.generateAccessToken(
                testParent.getId(), testParent.getEmail(), testParent.getRole());
    }

    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    @SuppressWarnings("unchecked")
    protected <T> T parseData(String json, Class<T> dataClass) throws Exception {
        var apiResponse = objectMapper.readValue(json, ApiResponse.class);
        if (apiResponse.getData() == null) {
            return null;
        }
        // Convert LinkedHashMap to the expected type using convertValue
        return objectMapper.convertValue(apiResponse.getData(), dataClass);
    }
}
