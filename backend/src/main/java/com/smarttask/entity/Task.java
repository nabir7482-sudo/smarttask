package com.smarttask.entity;

import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Task JPA Entity representing the 'tasks' table in the database.
 *
 * Key JPA Annotations Explained (Great for Interview):
 * - @Entity: Marks this class as a persistent database entity managed by Hibernate.
 * - @Table(name = "tasks"): Specifies the table name in the relational database.
 * - @Id: Marks the primary key field.
 * - @GeneratedValue(strategy = GenerationType.IDENTITY): Uses auto-increment primary keys.
 * - @Enumerated(EnumType.STRING): Stores enum names as readable VARCHAR instead of ordinal integers.
 * - @PrePersist: Automatically sets createdDate right before the entity is first saved.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDate createdDate;

    @Column(name = "assignee_name", nullable = false, length = 60)
    private String assigneeName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    // Default No-Args Constructor (Required by JPA/Hibernate reflection)
    public Task() {
    }

    // Parameterized Constructor
    public Task(Long id, String title, String description, TaskPriority priority,
                TaskStatus status, LocalDate dueDate, LocalDate createdDate, String assigneeName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.createdDate = createdDate;
        this.assigneeName = assigneeName;
    }

    // Lifecycle hook: auto-assign createdDate if not already provided
    @PrePersis
    protected void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = TaskStatus.TODO;
        }
        if (this.priority == null) {
            this.priority = TaskPriority.MEDIUM;
        }
    }

    // Getters and Setters (Encapsulation OOP Principle)
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

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
        if (assignee != null && (this.assigneeName == null || this.assigneeName.trim().isEmpty())) {
            this.assigneeName = assignee.getName();
        }
    }

    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", priority=" + priority +
                ", status=" + status +
                ", dueDate=" + dueDate +
                ", createdDate=" + createdDate +
                ", assigneeName='" + assigneeName + '\'' +
                '}';
    }
}
