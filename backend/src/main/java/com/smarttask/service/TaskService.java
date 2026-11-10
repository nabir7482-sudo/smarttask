package com.smarttask.service;

import com.smarttask.dto.DashboardSummaryDto;
import com.smarttask.dto.TaskRequestDto;
import com.smarttask.dto.TaskResponseDto;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;

import java.util.List;

/**
 * Service Layer Interface defining the business logic contract for SmartTask.
 *
 * Why use an interface here? (Frequent Interview Question):
 * 1. Abstraction: Hides implementation details from controllers.
 * 2. Loose Coupling: Controller depends on abstraction, adhering to Dependency Inversion (SOLID).
 * 3. Testability: Allows easy mocking of TaskService in unit tests using Mockito.
 */
public interface TaskService {

    List<TaskResponseDto> getAllTasks(TaskStatus status, TaskPriority priority, String search);

    TaskResponseDto getTaskById(Long id);

    TaskResponseDto createTask(TaskRequestDto request);

    TaskResponseDto updateTask(Long id, TaskRequestDto request);

    TaskResponseDto patchTaskStatus(Long id, TaskStatus status);

    void deleteTask(Long id);

    DashboardSummaryDto getDashboardSummary();

    void seedSampleData();
}
