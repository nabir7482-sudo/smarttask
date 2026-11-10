package com.smarttask.service;

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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of TaskService with Role-Based Access Control (RBAC).
 * Enforces employee task isolation and prevents unauthorized URL ID tampering.
 */
@Service
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private boolean isAssignedToUser(Task task, User user) {
        if (task == null || user == null) return false;
        if (task.getAssignee() != null && task.getAssignee().getId().equals(user.getId())) {
            return true;
        }
        return task.getAssigneeName() != null && task.getAssigneeName().trim().equalsIgnoreCase(user.getName().trim());
    }

    @Override
    public List<TaskResponseDto> getAllTasks(TaskStatus status, TaskPriority priority, String search) {
        User user = getCurrentAuthenticatedUser();

        List<Task> tasks;
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            // Employee isolation: employee can only receive their assigned tasks
            tasks = taskRepository.filterTasksForEmployee(user.getId(), user.getName(), status, priority, search);
        } else {
            // Admin: receives all tasks across employees
            if (status == null && priority == null && (search == null || search.trim().isEmpty())) {
                tasks = taskRepository.findAll();
            } else {
                tasks = taskRepository.filterTasks(status, priority, search);
            }
        }

        return tasks.stream()
                .map(TaskResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDto getTaskById(Long id) {
        Task task = findTaskOrThrow(id);
        User user = getCurrentAuthenticatedUser();

        // Enforce employee isolation: prevent tampering with ID in URL
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            if (!isAssignedToUser(task, user)) {
                throw new AccessDeniedException("Access Denied: You cannot view tasks assigned to other employees.");
            }
        }

        return TaskResponseDto.fromEntity(task);
    }

    @Override
    @Transactional
    public TaskResponseDto createTask(TaskRequestDto request) {
        User user = getCurrentAuthenticatedUser();

        // Only ADMIN can create tasks
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            throw new AccessDeniedException("Access Denied: Employees cannot create tasks. Only Admins can assign tasks.");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setAssigneeName(request.getAssigneeName());
        task.setCreatedDate(LocalDate.now());

        // Associate with employee user entity if available
        if (request.getAssigneeName() != null) {
            userRepository.findAll().stream()
                    .filter(u -> u.getName().equalsIgnoreCase(request.getAssigneeName().trim()))
                    .findFirst()
                    .ifPresent(task::setAssignee);
        }

        Task saved = taskRepository.save(task);
        return TaskResponseDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public TaskResponseDto updateTask(Long id, TaskRequestDto request) {
        Task task = findTaskOrThrow(id);
        User user = getCurrentAuthenticatedUser();

        // Only ADMIN can edit task specification
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            throw new AccessDeniedException("Access Denied: Only Admins can modify task details.");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setAssigneeName(request.getAssigneeName());

        // Update assignee reference
        if (request.getAssigneeName() != null) {
            userRepository.findAll().stream()
                    .filter(u -> u.getName().equalsIgnoreCase(request.getAssigneeName().trim()))
                    .findFirst()
                    .ifPresent(task::setAssignee);
        }

        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public TaskResponseDto patchTaskStatus(Long id, TaskStatus status) {
        Task task = findTaskOrThrow(id);
        User user = getCurrentAuthenticatedUser();

        // If employee, verify the task is assigned to them before allowing status update
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            if (!isAssignedToUser(task, user)) {
                throw new AccessDeniedException("Access Denied: You can only update the status of tasks assigned to you.");
            }
        }

        task.setStatus(status);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        User user = getCurrentAuthenticatedUser();

        // Only ADMIN can delete tasks
        if (user != null && user.getRole() == Role.EMPLOYEE) {
            throw new AccessDeniedException("Access Denied: Employees cannot delete tasks.");
        }

        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task", "id", id);
        }
        taskRepository.deleteById(id);
    }

    @Override
    public DashboardSummaryDto getDashboardSummary() {
        User user = getCurrentAuthenticatedUser();

        if (user != null && user.getRole() == Role.EMPLOYEE) {
            // Isolated metrics for employee
            long total = taskRepository.countForEmployee(user.getId(), user.getName());
            long todo = taskRepository.countForEmployeeByStatus(user.getId(), user.getName(), TaskStatus.TODO);
            long inProgress = taskRepository.countForEmployeeByStatus(user.getId(), user.getName(), TaskStatus.IN_PROGRESS);
            long completed = taskRepository.countForEmployeeByStatus(user.getId(), user.getName(), TaskStatus.COMPLETED);
            long highPriority = taskRepository.countForEmployeeByPriority(user.getId(), user.getName(), TaskPriority.HIGH);
            long overdue = taskRepository.countForEmployeeOverdue(user.getId(), user.getName(), LocalDate.now(), TaskStatus.COMPLETED);

            double completionRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
            completionRate = Math.round(completionRate * 10.0) / 10.0;

            return new DashboardSummaryDto(total, todo, inProgress, completed, highPriority, overdue, completionRate);
        }

        // Full company metrics for ADMIN
        long total = taskRepository.count();
        long todo = taskRepository.countByStatus(TaskStatus.TODO);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long highPriority = taskRepository.countByPriority(TaskPriority.HIGH);
        long overdue = taskRepository.countByDueDateBeforeAndStatusNot(LocalDate.now(), TaskStatus.COMPLETED);

        double completionRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
        completionRate = Math.round(completionRate * 10.0) / 10.0;

        return new DashboardSummaryDto(
                total,
                todo,
                inProgress,
                completed,
                highPriority,
                overdue,
                completionRate
        );
    }

    @Override
    @Transactional
    public void seedSampleData() {
        taskRepository.deleteAll();

        List<Task> sampleTasks = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Find users for relational linking
        User aarav = userRepository.findByEmail("aarav@smarttask.com").orElse(null);
        User priya = userRepository.findByEmail("priya@smarttask.com").orElse(null);
        User rohan = userRepository.findByEmail("rohan@smarttask.com").orElse(null);
        User neha = userRepository.findByEmail("neha@smarttask.com").orElse(null);
        User vikram = userRepository.findByEmail("vikram@smarttask.com").orElse(null);
        User ananya = userRepository.findByEmail("ananya@smarttask.com").orElse(null);

        Task t1 = new Task(null, "Design Database Schema for Payroll",
                "Define tables for employees, salaries, allowances, and tax deductions in PostgreSQL/H2.",
                TaskPriority.HIGH, TaskStatus.IN_PROGRESS, today.plusDays(3), today.minusDays(2), "Aarav Sharma");
        t1.setAssignee(aarav);
        sampleTasks.add(t1);

        Task t2 = new Task(null, "Implement JWT Authentication Filter",
                "Create OncePerRequestFilter to parse Authorization Bearer tokens and populate SecurityContext.",
                TaskPriority.HIGH, TaskStatus.TODO, today.plusDays(1), today.minusDays(1), "Priya Patel");
        t2.setAssignee(priya);
        sampleTasks.add(t2);

        Task t3 = new Task(null, "Develop Frontend Employee Dashboard",
                "Build responsive React cards, filtering dropdowns, and search bar with Tailwind CSS.",
                TaskPriority.MEDIUM, TaskStatus.COMPLETED, today.minusDays(1), today.minusDays(4), "Rohan Verma");
        t3.setAssignee(rohan);
        sampleTasks.add(t3);

        Task t4 = new Task(null, "Write Unit Tests for TaskService",
                "Cover positive and negative cases using JUnit 5, Mockito verify, and AssertJ assertions.",
                TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, today.plusDays(4), today.minusDays(3), "Neha Gupta");
        t4.setAssignee(neha);
        sampleTasks.add(t4);

        Task t5 = new Task(null, "Setup CI/CD Pipeline on GitHub Actions",
                "Automate Maven test execution and container build on push to main branch.",
                TaskPriority.LOW, TaskStatus.TODO, today.plusDays(7), today.minusDays(1), "Vikram Singh");
        t5.setAssignee(vikram);
        sampleTasks.add(t5);

        Task t6 = new Task(null, "Conduct Code Review for Sprint 4",
                "Review pull requests for clean code standards, naming conventions, and exception handling.",
                TaskPriority.HIGH, TaskStatus.TODO, today.minusDays(1), today.minusDays(5), "Ananya Iyer");
        t6.setAssignee(ananya);
        sampleTasks.add(t6);

        Task t7 = new Task(null, "Optimize Hibernate N+1 Query in Reports",
                "Replace default lazy loading with JOIN FETCH and EntityGraph for bulk task reports.",
                TaskPriority.MEDIUM, TaskStatus.COMPLETED, today.minusDays(2), today.minusDays(6), "Aarav Sharma");
        t7.setAssignee(aarav);
        sampleTasks.add(t7);

        Task t8 = new Task(null, "Configure Global CORS Policy in Spring",
                "Allow cross-origin preflight requests from React Vite dev server on port 3000.",
                TaskPriority.LOW, TaskStatus.COMPLETED, today.minusDays(3), today.minusDays(7), "Priya Patel");
        t8.setAssignee(priya);
        sampleTasks.add(t8);

        taskRepository.saveAll(sampleTasks);
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }
}
