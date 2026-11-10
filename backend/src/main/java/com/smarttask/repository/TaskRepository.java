package com.smarttask.repository;

import com.smarttask.entity.Task;
import com.smarttask.enums.TaskPriority;
import com.smarttask.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Derived Query Methods (Spring Data creates SQL from method names)
    List<Task> findByStatus(TaskStatus status);

    List<Task> findByPriority(TaskPriority priority);

    List<Task> findByTitleContainingIgnoreCase(String title);

    long countByStatus(TaskStatus status);

    long countByPriority(TaskPriority priority);

    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);

    /**
     * Custom JPQL query for dynamic filtering by status, priority, and search keyword.
     * Searches across both task title and assignee name.
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR TRIM(:search) = '' OR " +
           " LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.assigneeName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.id DESC")
    List<Task> filterTasks(@Param("status") TaskStatus status,
                           @Param("priority") TaskPriority priority,
                           @Param("search") String search);

    /**
     * Scoped filter query for individual employee:
     * Restricts results strictly to tasks assigned to this employee (by ID or matching name/email).
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(t.assignee.id = :employeeId OR LOWER(t.assigneeName) = LOWER(:employeeName)) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR TRIM(:search) = '' OR " +
           " LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.id DESC")
    List<Task> filterTasksForEmployee(@Param("employeeId") Long employeeId,
                                      @Param("employeeName") String employeeName,
                                      @Param("status") TaskStatus status,
                                      @Param("priority") TaskPriority priority,
                                      @Param("search") String search);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignee.id = :employeeId OR LOWER(t.assigneeName) = LOWER(:employeeName))")
    long countForEmployee(@Param("employeeId") Long employeeId, @Param("employeeName") String employeeName);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignee.id = :employeeId OR LOWER(t.assigneeName) = LOWER(:employeeName)) AND t.status = :status")
    long countForEmployeeByStatus(@Param("employeeId") Long employeeId, @Param("employeeName") String employeeName, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignee.id = :employeeId OR LOWER(t.assigneeName) = LOWER(:employeeName)) AND t.priority = :priority")
    long countForEmployeeByPriority(@Param("employeeId") Long employeeId, @Param("employeeName") String employeeName, @Param("priority") TaskPriority priority);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignee.id = :employeeId OR LOWER(t.assigneeName) = LOWER(:employeeName)) AND t.dueDate < :date AND t.status <> :status")
    long countForEmployeeOverdue(@Param("employeeId") Long employeeId, @Param("employeeName") String employeeName, @Param("date") LocalDate date, @Param("status") TaskStatus status);
}
