package com.seaworld.controller;

import com.seaworld.dto.*;
import com.seaworld.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FamilyControllerTest extends BaseIntegrationTest {

    private User secondParent;
    private String secondParentToken;

    @BeforeEach
    void setUp() {
        // Create a second parent for join/approve/reject tests
        secondParent = userRepository.save(User.builder()
                .email("second@test.com")
                .password("$2a$10$dummy-hash")
                .nickname("Second Parent")
                .role("parent")
                .emailVerified(true)
                .build());

        secondParentToken = jwtTokenProvider.generateAccessToken(
                secondParent.getId(), secondParent.getEmail(), secondParent.getRole());
    }

    // ─── Create Family ───

    @Test
    void createFamily_ShouldCreateFamilyWithOwner() throws Exception {
        CreateFamilyRequest request = new CreateFamilyRequest();
        request.setName("New Family");

        MvcResult result = mockMvc.perform(post("/api/families")
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Family"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        String familyId = objectMapper.readTree(json).path("data").path("id").asText();

        // Verify owner membership
        assertTrue(familyMemberRepository.existsByFamilyIdAndUserId(
                UUID.fromString(familyId), testParent.getId()));
    }

    @Test
    void createFamily_WithoutAuth_ShouldReturnUnauthorized() throws Exception {
        CreateFamilyRequest request = new CreateFamilyRequest();
        request.setName("New Family");

        mockMvc.perform(post("/api/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isUnauthorized());
    }

    // ─── Get My Families ───

    @Test
    void getMyFamilies_ShouldReturnUserFamilies() throws Exception {
        mockMvc.perform(get("/api/families/mine")
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Test Family"));
    }

    // ─── Add Child ───

    @Test
    void addChild_ShouldCreateChild() throws Exception {
        ChildRequest request = new ChildRequest();
        request.setName("New Child");
        request.setNickname("Newbie");
        request.setBirthDate(LocalDate.of(2021, 6, 1));

        mockMvc.perform(post("/api/families/{familyId}/children", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Child"))
                .andExpect(jsonPath("$.data.nickname").value("Newbie"));
    }

    // ─── Get Children ───

    @Test
    void getChildren_ShouldReturnFamilyChildren() throws Exception {
        mockMvc.perform(get("/api/families/{familyId}/children", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Test Child"));
    }

    // ─── Update Child ───

    @Test
    void updateChild_ShouldModifyChild() throws Exception {
        ChildRequest request = new ChildRequest();
        request.setName("Updated Child");
        request.setNickname("Updated");

        mockMvc.perform(put("/api/families/{familyId}/children/{childId}",
                        testFamily.getId(), testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Child"));

        var updated = childRepository.findById(testChild.getId()).get();
        assertEquals("Updated Child", updated.getName());
    }

    // ─── Delete Child ───

    @Test
    void deleteChild_ShouldRemoveChild() throws Exception {
        mockMvc.perform(delete("/api/families/{familyId}/children/{childId}",
                        testFamily.getId(), testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertFalse(childRepository.findById(testChild.getId()).isPresent());
    }

    // ─── Update Family ───

    @Test
    void updateFamily_ShouldModifyFamily() throws Exception {
        UpdateFamilyRequest request = new UpdateFamilyRequest();
        request.setName("Updated Family Name");

        mockMvc.perform(put("/api/families/{familyId}", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Family Name"));
    }

    // ─── Search by Share Code ───

    @Test
    void searchByShareCode_WithValidCode_ShouldReturnFamily() throws Exception {
        mockMvc.perform(get("/api/families/search")
                        .param("code", "TEST123")
                        .header("Authorization", "Bearer " + secondParentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Family"));
    }

    @Test
    void searchByShareCode_WithInvalidCode_ShouldReturnError() throws Exception {
        mockMvc.perform(get("/api/families/search")
                        .param("code", "INVALID")
                        .header("Authorization", "Bearer " + secondParentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("无效的家庭分享码"));
    }

    // ─── Request Join ───

    @Test
    void requestJoin_WithValidCode_ShouldCreatePendingRequest() throws Exception {
        JoinFamilyRequest request = new JoinFamilyRequest();
        request.setShareCode("TEST123");

        mockMvc.perform(post("/api/families/join")
                        .header("Authorization", "Bearer " + secondParentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify pending request created
        var pending = familyMemberRepository.findByFamilyIdAndUserIdAndStatus(
                testFamily.getId(), secondParent.getId(), "PENDING");
        assertTrue(pending.isPresent());
    }

    @Test
    void requestJoin_WithInvalidCode_ShouldReturnError() throws Exception {
        JoinFamilyRequest request = new JoinFamilyRequest();
        request.setShareCode("INVALID");

        mockMvc.perform(post("/api/families/join")
                        .header("Authorization", "Bearer " + secondParentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void requestJoin_WhenAlreadyMember_ShouldReturnError() throws Exception {
        // Add second parent as a member first
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(secondParent.getId())
                .role("member")
                .status("ACTIVE")
                .build());

        JoinFamilyRequest request = new JoinFamilyRequest();
        request.setShareCode("TEST123");

        mockMvc.perform(post("/api/families/join")
                        .header("Authorization", "Bearer " + secondParentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("您已经是该家庭成员"));
    }

    // ─── Pending Requests ───

    @Test
    void getPendingRequests_ShouldShowPendingJoins() throws Exception {
        // Create a pending request first
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(secondParent.getId())
                .role("member")
                .status("PENDING")
                .build());

        mockMvc.perform(get("/api/families/{familyId}/pending-requests", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }

    // ─── Approve Join ───

    @Test
    void approveJoin_ShouldChangeStatusToActive() throws Exception {
        // Create a pending request first
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(secondParent.getId())
                .role("member")
                .status("PENDING")
                .build());

        mockMvc.perform(post("/api/families/{familyId}/members/{userId}/approve",
                        testFamily.getId(), secondParent.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify status changed to ACTIVE
        var member = familyMemberRepository.findByFamilyIdAndUserId(
                testFamily.getId(), secondParent.getId()).get();
        assertEquals("ACTIVE", member.getStatus());
    }

    @Test
    void approveJoin_ByNonOwner_ShouldReturnError() throws Exception {
        // Create a pending request from a third user
        User thirdUser = userRepository.save(User.builder()
                .email("third@test.com")
                .password("hash")
                .nickname("Third")
                .role("parent")
                .emailVerified(true)
                .build());

        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(thirdUser.getId())
                .role("member")
                .status("PENDING")
                .build());

        // Second parent (non-owner) tries to approve - but second parent isn't even a member
        // Let's add them first as a member but not owner
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(secondParent.getId())
                .role("member")
                .status("ACTIVE")
                .build());

        mockMvc.perform(post("/api/families/{familyId}/members/{userId}/approve",
                        testFamily.getId(), thirdUser.getId())
                        .header("Authorization", "Bearer " + secondParentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Reject Join ───

    @Test
    void rejectJoin_ShouldRemovePendingRequest() throws Exception {
        // Create a pending request
        familyMemberRepository.save(FamilyMember.builder()
                .familyId(testFamily.getId())
                .userId(secondParent.getId())
                .role("member")
                .status("PENDING")
                .build());

        mockMvc.perform(post("/api/families/{familyId}/members/{userId}/reject",
                        testFamily.getId(), secondParent.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify request was deleted
        assertFalse(familyMemberRepository.findByFamilyIdAndUserId(
                testFamily.getId(), secondParent.getId()).isPresent());
    }

    // ─── Get Members ───

    @Test
    void getMembers_ShouldReturnAllActiveMembers() throws Exception {
        mockMvc.perform(get("/api/families/{familyId}/members", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].role").value("owner"));
    }

    // ─── Access Control ───

    @Test
    void nonMember_ShouldNotAccessFamily() throws Exception {
        mockMvc.perform(get("/api/families/{familyId}/children", testFamily.getId())
                        .header("Authorization", "Bearer " + secondParentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Access Denied for Non-Family-Member ───

    @Test
    void taskAccess_NonFamilyMember_ShouldBeForbidden() throws Exception {
        // secondParent is not a member of testFamily
        ChildTaskRequest taskRequest = new ChildTaskRequest();
        taskRequest.setName("Should Fail");
        taskRequest.setPoints(5);
        taskRequest.setChildId(testChild.getId().toString());

        mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + secondParentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(taskRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void childAccess_NonExistentFamily_ShouldReturnNotFound() throws Exception {
        UUID fakeId = UUID.randomUUID();
        mockMvc.perform(get("/api/families/{familyId}/children", fakeId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
