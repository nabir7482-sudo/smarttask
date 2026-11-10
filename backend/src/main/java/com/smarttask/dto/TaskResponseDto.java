package com.smarttask.dto;

import com.smarttask.entity.Task;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import java.time.LocalDate;

/**
 * Data Transfer Object sent back in API responses.
 * Encapsulates the task data cleanly for client consumption.
 */
public class TaskResponseDto {

    private Long id;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private LocalDate createdDate;
    private String assigneeName;
    private Long assigneeId;
    private String assigneeEmail;
    private boolean isOverdue;

    public TaskResponseDto() {
    }

    public TaskResponseDto(Long id, String title, String description, TaskPriority priority,
                           TaskStatus status, LocalDate dueDate, LocalDate createdDate,
                           String assigneeName, Long assigneeId, String assigneeEmail, boolean isOverdue) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.createdDate = createdDate;
        this.assigneeName = assigneeName;
        this.assigneeId = assigneeId;
        this.assigneeEmail = assigneeEmail;
        this.isOverdue = isOverdue;
    }

    /**
     * Factory method to convert Task JPA Entity to TaskResponseDto.
     * Computes whether the task is overdue based on current date and completion status.
     */
    public static TaskResponseDto fromEntity(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.COMPLETED;

        Long aId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        String aEmail = task.getAssignee() != null ? task.getAssignee().getEmail() : null;
        String aName = task.getAssignee() != null ? task.getAssignee().getName() : task.getAssigneeName();

        return new TaskResponseDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedDate(),
                aName,
                aId,
                aEmail,
                overdue
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssigneeEmail() {
        return assigneeEmail;
    }

    public void setAssigneeEmail(String assigneeEmail) {
        this.assigneeEmail = assigneeEmail;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }
}
