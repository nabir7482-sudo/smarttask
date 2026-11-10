package com.smarttask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask.controller.TaskController;
import com.smarttask.dto.DashboardSummaryDto;
import com.smarttask.dto.TaskRequestDto;
import com.smarttask.dto.TaskResponseDto;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import com.smarttask.exception.GlobalExceptionHandler;
import com.smarttask.exception.ResourceNotFoundException;
import com.smarttask.security.CustomUserDetailsService;
import com.smarttask.security.JwtTokenProvider;
import com.smarttask.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller-layer Tests using Spring Boot @WebMvcTest and MockMvc.
 */
@WebMvcTest(TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Tes
    @DisplayName("GET /api/tasks: Should return 200 OK with list of tasks")
    void testGetAllTasks_ReturnsList() throws Exception {
        TaskResponseDto dto = new TaskResponseDto(
                1L, "Write Documentation", "Project README",
                TaskPriority.HIGH, TaskStatus.TODO,
                LocalDate.now().plusDays(2), LocalDate.now(), "Dev User", 1L, "dev@smarttask.com", false
        );

        when(taskService.getAllTasks(null, null, null))
                .thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Write Documentation"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Tes
    @DisplayName("POST /api/tasks: Should return 201 Created when request is valid")
    void testCreateTask_ValidInput_Returns201() throws Exception {
        TaskRequestDto request = new TaskRequestDto(
                "Create API Endpoint", "Build POST endpoint for tasks",
                TaskPriority.MEDIUM, TaskStatus.TODO,
                LocalDate.now().plusDays(3), "Aarav Sharma"
        );

        TaskResponseDto response = new TaskResponseDto(
                10L, "Create API Endpoint", "Build POST endpoint for tasks",
                TaskPriority.MEDIUM, TaskStatus.TODO,
                LocalDate.now().plusDays(3), LocalDate.now(), "Aarav Sharma", 2L, "aarav@smarttask.com", false
        );

        when(taskService.createTask(any(TaskRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.title").value("Create API Endpoint"));
    }

    @Tes
    @DisplayName("POST /api/tasks: Should return 400 Bad Request when title is blank")
    void testCreateTask_InvalidInput_Returns400() throws Exception {
        TaskRequestDto invalidRequest = new TaskRequestDto(
                "", "", TaskPriority.MEDIUM, TaskStatus.TODO, null, ""
        );

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.title").exists())
                .andExpect(jsonPath("$.fieldErrors.assigneeName").exists());
    }

    @Tes
    @DisplayName("GET /api/tasks/{id}: Should return 404 Not Found when task doesn't exist")
    void testGetTaskById_NotFound_Returns404() throws Exception {
        when(taskService.getTaskById(999L))
                .thenThrow(new ResourceNotFoundException("Task", "id", 999L));

        mockMvc.perform(get("/api/tasks/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Task not found with id : '999'"));
    }

    @Tes
    @DisplayName("DELETE /api/tasks/{id}: Should return 204 No Content on success")
    void testDeleteTask_Returns204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Tes
    @DisplayName("GET /api/tasks/dashboard: Should return 200 OK with summary numbers")
    void testGetDashboardSummary_Returns200() throws Exception {
        DashboardSummaryDto summary = new DashboardSummaryDto(10, 4, 3, 3, 2, 1, 30.0);
        when(taskService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/tasks/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").value(10))
                .andExpect(jsonPath("$.todoTasks").value(4))
                .andExpect(jsonPath("$.inProgressTasks").value(3))
                .andExpect(jsonPath("$.completedTasks").value(3))
                .andExpect(jsonPath("$.completionRate").value(30.0));
    }
}
