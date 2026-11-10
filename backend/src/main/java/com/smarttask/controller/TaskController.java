package com.smarttask.controller;

import com.smarttask.dto.DashboardSummaryDto;
import com.smarttask.dto.TaskRequestDto;
import com.smarttask.dto.TaskResponseDto;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import com.smarttask.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller exposing Task Management endpoints under /api/tasks.
 *
 * Key Interview Concepts:
 * - @RestController: Combines @Controller and @ResponseBody; serializes return values directly to JSON.
 * - @RequestMapping("/api/tasks"): Defines the base URL prefix for all endpoints in this controller.
 * - @CrossOrigin: Enables Cross-Origin Resource Sharing so React Vite frontend can consume the API.
 * - HTTP Status Codes:
 *     - 200 OK: Successful retrieval/update
 *     - 201 CREATED: Successful creation (POST)
 *     - 204 NO CONTENT: Successful deletion
 *     - 400 BAD REQUEST: Bean validation failure
 *     - 404 NOT FOUND: Resource not found
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "*"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
                        RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TaskController {

    private final TaskService taskService;

    // Constructor Injection
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Health check endpoint to verify backend status.
     * GET /api/tasks/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "SmartTask Employee Task Management System");
        health.put("framework", "Spring Boot 3.5.16 (Java 17)");
        health.put("database", "H2 In-Memory (Zero Configuration)");
        health.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(health);
    }

    /**
     * Retrieve all tasks with optional filtering by status, priority, and keyword search.
     * GET /api/tasks?status=IN_PROGRESS&priority=HIGH&search=JWT
     */
    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String search) {
        List<TaskResponseDto> tasks = taskService.getAllTasks(status, priority, search);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Retrieve a single task by its database ID.
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable Long id) {
        TaskResponseDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * Create a new task (Admin only).
     * POST /api/tasks
     * Returns HTTP 201 Created on success.
     */
    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponseDto> createTask(@Valid @RequestBody TaskRequestDto request) {
        TaskResponseDto created = taskService.createTask(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Update an existing task completely (Admin only).
     * PUT /api/tasks/{id}
     * Returns HTTP 200 OK.
     */
    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDto request) {
        TaskResponseDto updated = taskService.updateTask(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Partially update the status of an existing task.
     * Accessible by Admin or the Employee assigned to this task.
     * PATCH /api/tasks/{id}/status?status=COMPLETED
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDto> patchTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        TaskResponseDto updated = taskService.patchTaskStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a task by ID (Admin only).
     * DELETE /api/tasks/{id}
     * Returns HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get aggregated metrics for dashboard cards.
     * GET /api/tasks/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        DashboardSummaryDto summary = taskService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Reset and seed sample realistic employee tasks (Admin only).
     * POST /api/tasks/seed
     */
    @PostMapping("/seed")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> seedSampleData() {
        taskService.seedSampleData();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Sample tasks seeded successfully");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
