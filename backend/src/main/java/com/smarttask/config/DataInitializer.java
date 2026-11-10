package com.smarttask.config;

import com.smarttask.entity.User;
import com.smarttask.enums.Role;
import com.smarttask.repository.TaskRepository;
import com.smarttask.repository.UserRepository;
import com.smarttask.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * DataInitializer runs automatically upon application startup.
 * Seeds initial Admin and Employee accounts, then populates initial realistic tasks.
 */
@Componen
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TaskRepository taskRepository,
                           TaskService taskService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.taskService = taskService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsersIfEmpty();

        if (taskRepository.count() == 0) {
            log.info("Database has zero tasks. Seeding initial realistic employee tasks...");
            taskService.seedSampleData();
            log.info("Loaded {} tasks into database.", taskRepository.count());
        }
    }

    private void seedUsersIfEmpty() {
        if (userRepository.count() == 0) {
            log.info("Seeding Admin and Employee accounts...");

            // 1. Admin Accoun
            User admin = new User(
                    null,
                    "Admin User",
                    "admin@smarttask.com",
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN,
                    LocalDate.now().minusMonths(6)
            );

            // 2. Employee Accounts
            List<User> employees = Arrays.asList(
                    new User(null, "Aarav Sharma", "aarav@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(4)),
                    new User(null, "Priya Patel", "priya@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(3)),
                    new User(null, "Rohan Verma", "rohan@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(3)),
                    new User(null, "Neha Gupta", "neha@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(2)),
                    new User(null, "Vikram Singh", "vikram@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(2)),
                    new User(null, "Ananya Iyer", "ananya@smarttask.com", passwordEncoder.encode("Employee@123"), Role.EMPLOYEE, LocalDate.now().minusMonths(1))
            );

            userRepository.save(admin);
            userRepository.saveAll(employees);
            log.info("Seeded 1 Admin and {} Employee accounts.", employees.size());
        }
    }
}
