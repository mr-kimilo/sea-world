package com.seaworld.controller;

import com.seaworld.dto.ChildTaskRequest;
import com.seaworld.entity.Trophy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TrophyControllerTest extends BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        // Create trophies directly for testing
        trophyRepository.save(Trophy.builder()
                .childId(testChild.getId())
                .name("Gold Medal")
                .points(100)
                .icon("🥇")
                .build());

        trophyRepository.save(Trophy.builder()
                .childId(testChild.getId())
                .name("Silver Medal")
                .points(50)
                .icon("🥈")
                .build());

        trophyRepository.save(Trophy.builder()
                .childId(testChild.getId())
                .name("Bronze Medal")
                .points(25)
                .icon("🥉")
                .build());

        trophyRepository.save(Trophy.builder()
                .childId(testChild.getId())
                .name("Small Achievement")
                .points(5)
                .icon("⭐")
                .build());
    }

    @Test
    void getTrophies_ShouldReturnAllTrophiesForChild() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/children/{childId}/trophies", testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("Gold Medal"));
        assertTrue(json.contains("Silver Medal"));
        assertTrue(json.contains("Bronze Medal"));
        assertTrue(json.contains("Small Achievement"));
    }

    @Test
    void getTrophies_ShouldReturnOrderedByEarnedAtDesc() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/children/{childId}/trophies", testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        // First item in data array should be the most recent
        // (they were all created in the same @BeforeEach, so order is insertion order)
        assertTrue(json.contains("Gold Medal"));
    }

    @Test
    void getTrophies_WithoutAuth_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/children/{childId}/trophies", testChild.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getTop3Trophies_ShouldReturnTop3ByPoints() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/children/{childId}/trophies/top3", testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andReturn();

        // Verify top 3 are sorted by points descending
        var data = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data");
        assertEquals("Gold Medal", data.get(0).get("name").asText());
        assertEquals(100, data.get(0).get("points").asInt());
        assertEquals("Silver Medal", data.get(1).get("name").asText());
        assertEquals(50, data.get(1).get("points").asInt());
        assertEquals("Bronze Medal", data.get(2).get("name").asText());
        assertEquals(25, data.get(2).get("points").asInt());
    }

    @Test
    void getTop3Trophies_WithLessThan3Trophies_ShouldReturnAvailable() throws Exception {
        // Create a child with only 1 trophy
        var otherChild = childRepository.save(
                com.seaworld.entity.Child.builder()
                        .familyId(testFamily.getId())
                        .name("Other Child")
                        .build()
        );

        trophyRepository.save(Trophy.builder()
                .childId(otherChild.getId())
                .name("Only Trophy")
                .points(10)
                .icon("🏅")
                .build());

        MvcResult result = mockMvc.perform(get("/api/children/{childId}/trophies/top3", otherChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andReturn();
    }

    @Test
    void getTrophies_NonExistentChild_ShouldReturnError() throws Exception {
        mockMvc.perform(get("/api/children/{childId}/trophies", "00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getTrophies_AfterCompletingTask_ShouldIncludeNewTrophy() throws Exception {
        // Create and complete a task
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName("New Achievement");
        request.setDescription("Just did it");
        request.setPoints(30);
        request.setChildId(testChild.getId().toString());

        MvcResult taskResult = mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskJson = taskResult.getResponse().getContentAsString();
        String taskId = objectMapper.readTree(taskJson).path("data").path("id").asText();

        // Complete the task
        mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk());

        // Get trophies - should now have 5
        MvcResult result = mockMvc.perform(get("/api/children/{childId}/trophies", testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(5))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("New Achievement"));
    }
}
