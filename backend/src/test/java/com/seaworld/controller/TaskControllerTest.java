package com.seaworld.controller;

import com.seaworld.dto.ChildTaskRequest;
import com.seaworld.entity.TaskTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TaskControllerTest extends BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        // Create task templates for testing
        taskTemplateRepository.save(TaskTemplate.builder()
                .grade("grade1")
                .name("Read a Book")
                .description("Read for 30 minutes")
                .points(10)
                .icon("📖")
                .trophyName("Bookworm")
                .sortOrder(1)
                .isActive(true)
                .build());

        taskTemplateRepository.save(TaskTemplate.builder()
                .grade("grade1")
                .name("Clean Room")
                .description("Tidy up your room")
                .points(5)
                .icon("🧹")
                .sortOrder(2)
                .isActive(true)
                .build());

        taskTemplateRepository.save(TaskTemplate.builder()
                .grade("grade2")
                .name("Math Practice")
                .description("Complete math exercises")
                .points(15)
                .icon("📐")
                .trophyName("Math Whiz")
                .sortOrder(1)
                .isActive(true)
                .build());
    }

    // ─── Task Templates ───

    @Test
    void getTemplates_WithoutGrade_ShouldReturnAllTemplates() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/task-templates")
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("Read a Book"));
        assertTrue(json.contains("Clean Room"));
        assertTrue(json.contains("Math Practice"));
    }

    @Test
    void getTemplates_WithGrade_ShouldReturnFilteredTemplates() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/task-templates")
                        .param("grade", "grade1")
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("Read a Book"));
        assertTrue(json.contains("Clean Room"));
        assertFalse(json.contains("Math Practice"));
    }

    @Test
    void getTemplates_WithoutAuth_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/task-templates"))
                .andExpect(status().isUnauthorized());
    }

    // ─── Create Task ───

    @Test
    void createTask_ShouldCreatePendingTask() throws Exception {
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName("Practice Piano");
        request.setDescription("Practice for 20 minutes");
        request.setPoints(8);
        request.setIcon("🎹");
        request.setTrophyName("Piano Star");
        request.setChildId(testChild.getId().toString());

        MvcResult result = mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("Practice Piano"));
    }

    @Test
    void createTask_WithoutChildId_ShouldAssignToFirstChild() throws Exception {
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName("Draw a Picture");
        request.setDescription("Draw something creative");
        request.setPoints(5);

        MvcResult result = mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertTrue(json.contains("Draw a Picture"));
    }

    @Test
    void createTask_WithoutAuth_ShouldReturnUnauthorized() throws Exception {
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName("Test Task");
        request.setPoints(5);

        mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createTask_WithEmptyName_ShouldReturnValidationError() throws Exception {
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName("");
        request.setPoints(5);

        mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Get Tasks ───

    @Test
    void getChildTasks_ShouldReturnTasks() throws Exception {
        // First create a task
        createTestTask("Test Task 1", 5);

        mockMvc.perform(get("/api/children/{childId}/tasks", testChild.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getFamilyTasks_ShouldReturnAllFamilyTasks() throws Exception {
        createTestTask("Family Task 1", 5);

        mockMvc.perform(get("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    // ─── Update Task ───

    @Test
    void updateTask_ShouldModifyTask() throws Exception {
        // Create a task first
        String taskId = createTestTask("Original Name", 5);

        // Update it
        ChildTaskRequest updateRequest = new ChildTaskRequest();
        updateRequest.setName("Updated Name");
        updateRequest.setDescription("Updated description");
        updateRequest.setPoints(10);
        updateRequest.setIcon("⭐");

        MvcResult result = mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Name"))
                .andExpect(jsonPath("$.data.points").value(10))
                .andReturn();
    }

    // ─── Complete Task ───

    @Test
    void completeTask_ShouldAddScoreAndCreateTrophy() throws Exception {
        String taskId = createTestTask("Complete Me", 10);

        // Check child's initial score
        var childBefore = childRepository.findById(testChild.getId()).get();
        int scoreBefore = childBefore.getAvailableScore();

        // Complete the task
        MvcResult result = mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").isString())
                .andReturn();

        // Verify task status changed to COMPLETED
        var task = childTaskRepository.findById(java.util.UUID.fromString(taskId)).get();
        assertEquals("COMPLETED", task.getStatus());
        assertNotNull(task.getCompletedAt());

        // Verify child's score increased
        var childAfter = childRepository.findById(testChild.getId()).get();
        assertEquals(scoreBefore + 10, childAfter.getAvailableScore());

        // Verify trophy was created
        var trophies = trophyRepository.findByChildIdOrderByEarnedAtDesc(testChild.getId());
        assertFalse(trophies.isEmpty());
        assertEquals("Complete Me", trophies.get(0).getName());
        assertEquals(10, trophies.get(0).getPoints());
    }

    @Test
    void completeTask_WithTrophyName_ShouldUseTrophyName() throws Exception {
        String taskId = createTestTask("Task With Trophy", 15, "Super Trophy");

        mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Super Trophy"));

        var trophies = trophyRepository.findByChildIdOrderByEarnedAtDesc(testChild.getId());
        assertEquals("Super Trophy", trophies.get(0).getName());
    }

    @Test
    void completeTask_AlreadyCompleted_ShouldReturnError() throws Exception {
        String taskId = createTestTask("Already Done", 5);

        // Complete once
        mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk());

        // Complete again - should fail
        mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("任务已完成"));
    }

    // ─── Cancel Task ───

    @Test
    void cancelTask_ShouldChangeStatusToCancelled() throws Exception {
        String taskId = createTestTask("Cancel Me", 5);

        mockMvc.perform(post("/api/tasks/{taskId}/cancel", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        var task = childTaskRepository.findById(java.util.UUID.fromString(taskId)).get();
        assertEquals("CANCELLED", task.getStatus());
    }

    @Test
    void cancelTask_AlreadyCompleted_ShouldReturnError() throws Exception {
        String taskId = createTestTask("Complete then Cancel", 5);

        // Complete first
        mockMvc.perform(post("/api/tasks/{taskId}/complete", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk());

        // Cancel should fail
        mockMvc.perform(post("/api/tasks/{taskId}/cancel", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("任务已完成"));
    }

    // ─── Delete Task ───

    @Test
    void deleteTask_ShouldRemoveTask() throws Exception {
        String taskId = createTestTask("Delete Me", 5);

        mockMvc.perform(delete("/api/tasks/{taskId}", taskId)
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify task no longer exists
        assertFalse(childTaskRepository.findById(java.util.UUID.fromString(taskId)).isPresent());
    }

    @Test
    void deleteTask_NonExistent_ShouldReturnError() throws Exception {
        mockMvc.perform(delete("/api/tasks/{taskId}", "00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + parentAccessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Helper Methods ───

    private String createTestTask(String name, int points) throws Exception {
        return createTestTask(name, points, null);
    }

    private String createTestTask(String name, int points, String trophyName) throws Exception {
        ChildTaskRequest request = new ChildTaskRequest();
        request.setName(name);
        request.setDescription("Description for " + name);
        request.setPoints(points);
        request.setIcon("📋");
        request.setTrophyName(trophyName);
        request.setChildId(testChild.getId().toString());

        MvcResult result = mockMvc.perform(post("/api/families/{familyId}/tasks", testFamily.getId())
                        .header("Authorization", "Bearer " + parentAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        // Extract task ID from response
        return objectMapper.readTree(json).path("data").path("id").asText();
    }
}
