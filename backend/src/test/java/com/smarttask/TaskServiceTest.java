package com.smarttask;

import com.smarttask.dto.DashboardSummaryDto;
import com.smarttask.dto.TaskRequestDto;
import com.smarttask.dto.TaskResponseDto;
import com.smarttask.entity.Task;
import com.smarttask.entity.User;
import com.smarttask.enums.Role;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import com.smarttask.exception.ResourceNotFoundException;
import com.smarttask.repository.TaskRepository;
import com.smarttask.repository.UserRepository;
import com.smarttask.service.TaskServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for TaskServiceImpl verifying CRUD operations and RBAC isolation.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User adminUser;
    private User employeeUser;
    private User otherEmployeeUser;
    private Task sampleTask;
    private Task otherEmployeeTask;
    private TaskRequestDto sampleRequest;

    @BeforeEach
    void setUp() {
        adminUser = new User(1L, "System Admin", "admin@smarttask.com", "$2a$10$hash", Role.ADMIN, LocalDate.now());
        employeeUser = new User(2L, "Aarav Sharma", "aarav@smarttask.com", "$2a$10$hash", Role.EMPLOYEE, LocalDate.now());
        otherEmployeeUser = new User(3L, "Priya Patel", "priya@smarttask.com", "$2a$10$hash", Role.EMPLOYEE, LocalDate.now());

        sampleTask = new Task(
                1L,
                "Setup Spring Boot Project",
                "Initialize project with dependencies",
                TaskPriority.HIGH,
                TaskStatus.TODO,
                LocalDate.now().plusDays(5),
                LocalDate.now(),
                "Aarav Sharma"
        );
        sampleTask.setAssignee(employeeUser);

        otherEmployeeTask = new Task(
                2L,
                "Audit Security",
                "Review Spring Security filter chain",
                TaskPriority.MEDIUM,
                TaskStatus.IN_PROGRESS,
                LocalDate.now().plusDays(3),
                LocalDate.now(),
                "Priya Patel"
        );
        otherEmployeeTask.setAssignee(otherEmployeeUser);

        sampleRequest = new TaskRequestDto(
                "Setup Spring Boot Project",
                "Initialize project with dependencies",
                TaskPriority.HIGH,
                TaskStatus.TODO,
                LocalDate.now().plusDays(5),
                "Aarav Sharma"
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Tes
    @DisplayName("Admin: createTask should save and return TaskResponseDto")
    void testCreateTask_Admin_Success() {
        authenticateAs(adminUser);
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskResponseDto response = taskService.createTask(sampleRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Setup Spring Boot Project", response.getTitle());
        assertEquals(TaskPriority.HIGH, response.getPriority());
        assertEquals(TaskStatus.TODO, response.getStatus());
        assertEquals("Aarav Sharma", response.getAssigneeName());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Tes
    @DisplayName("Employee: createTask should throw AccessDeniedException")
    void testCreateTask_Employee_ThrowsAccessDenied() {
        authenticateAs(employeeUser);

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> taskService.createTask(sampleRequest)
        );

        assertTrue(exception.getMessage().contains("Employees cannot create tasks"));
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Tes
    @DisplayName("Admin: getTaskById should return task regardless of assignee")
    void testGetTaskById_Admin_Success() {
        authenticateAs(adminUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        TaskResponseDto response = taskService.getTaskById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Setup Spring Boot Project", response.getTitle());
    }

    @Tes
    @DisplayName("Employee: getTaskById should return own assigned task")
    void testGetTaskById_Employee_OwnTask_Success() {
        authenticateAs(employeeUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        TaskResponseDto response = taskService.getTaskById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Aarav Sharma", response.getAssigneeName());
    }

    @Tes
    @DisplayName("Employee: getTaskById on other employee's task throws AccessDeniedException (URL tampering protection)")
    void testGetTaskById_Employee_OtherTask_ThrowsAccessDenied() {
        authenticateAs(employeeUser);
        when(taskRepository.findById(2L)).thenReturn(Optional.of(otherEmployeeTask));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> taskService.getTaskById(2L)
        );

        assertTrue(exception.getMessage().contains("Access Denied: You cannot view tasks assigned to other employees"));
    }

    @Tes
    @DisplayName("getTaskById: Should throw ResourceNotFoundException when ID does not exist")
    void testGetTaskById_NotFound_ThrowsException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> taskService.getTaskById(999L)
        );

        assertTrue(exception.getMessage().contains("Task not found with id : '999'"));
    }

    @Tes
    @DisplayName("Employee: patchTaskStatus should succeed on own task")
    void testPatchTaskStatus_Employee_OwnTask_Success() {
        authenticateAs(employeeUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        TaskResponseDto response = taskService.patchTaskStatus(1L, TaskStatus.IN_PROGRESS);

        assertNotNull(response);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Tes
    @DisplayName("Employee: patchTaskStatus on another employee's task throws AccessDeniedException")
    void testPatchTaskStatus_Employee_OtherTask_ThrowsAccessDenied() {
        authenticateAs(employeeUser);
        when(taskRepository.findById(2L)).thenReturn(Optional.of(otherEmployeeTask));

        assertThrows(
                AccessDeniedException.class,
                () -> taskService.patchTaskStatus(2L, TaskStatus.COMPLETED)
        );
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Tes
    @DisplayName("Admin: deleteTask should delete task when ID exists")
    void testDeleteTask_Admin_Success() {
        authenticateAs(adminUser);
        when(taskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(taskRepository).deleteById(1L);

        assertDoesNotThrow(() -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).deleteById(1L);
    }

    @Tes
    @DisplayName("Employee: deleteTask should throw AccessDeniedException")
    void testDeleteTask_Employee_ThrowsAccessDenied() {
        authenticateAs(employeeUser);

        assertThrows(AccessDeniedException.class, () -> taskService.deleteTask(1L));
        verify(taskRepository, never()).deleteById(anyLong());
    }

    @Tes
    @DisplayName("getDashboardSummary: Should aggregate company metrics for Admin")
    void testGetDashboardSummary_Admin_Success() {
        authenticateAs(adminUser);
        when(taskRepository.count()).thenReturn(10L);
        when(taskRepository.countByStatus(TaskStatus.TODO)).thenReturn(4L);
        when(taskRepository.countByStatus(TaskStatus.IN_PROGRESS)).thenReturn(3L);
        when(taskRepository.countByStatus(TaskStatus.COMPLETED)).thenReturn(3L);
        when(taskRepository.countByPriority(TaskPriority.HIGH)).thenReturn(5L);
        when(taskRepository.countByDueDateBeforeAndStatusNot(any(LocalDate.class), eq(TaskStatus.COMPLETED))).thenReturn(1L);

        DashboardSummaryDto summary = taskService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(10L, summary.getTotalTasks());
        assertEquals(4L, summary.getTodoTasks());
        assertEquals(3L, summary.getInProgressTasks());
        assertEquals(3L, summary.getCompletedTasks());
        assertEquals(5L, summary.getHighPriorityTasks());
        assertEquals(1L, summary.getOverdueTasks());
        assertEquals(30.0, summary.getCompletionRate());
    }
}
