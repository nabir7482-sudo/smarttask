package com.smarttask.dto;

import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) for incoming task creation and update requests.
 *
 * Why use DTOs instead of exposing the Entity directly?
 * 1. Security: Prevents mass-assignment / over-posting vulnerabilities.
 * 2. Decoupling: Separates API payload contract from internal database schema.
 * 3. Validation: Allows input sanitization before entities are constructed.
 */
public class TaskRequestDto {

    @NotBlank(message = "Task title cannot be empty")
    @Size(min = 3, max = 100, message = "Task title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Priority is required (LOW, MEDIUM, HIGH)")
    private TaskPriority priority;

    @NotNull(message = "Status is required (TODO, IN_PROGRESS, COMPLETED)")
    private TaskStatus status;

    private LocalDate dueDate;

    @NotBlank(message = "Assignee name cannot be empty")
    @Size(min = 2, max = 60, message = "Assignee name must be between 2 and 60 characters")
    private String assigneeName;

    public TaskRequestDto() {
    }

    public TaskRequestDto(String title, String description, TaskPriority priority,
                          TaskStatus status, LocalDate dueDate, String assigneeName) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.assigneeName = assigneeName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }
}
