package com.smarttask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point for SmartTask.
 *
 * Key Interview Concepts:
 * - @SpringBootApplication: Combines three fundamental annotations:
 *     1. @Configuration: Tags the class as the source of bean definitions.
 *     2. @EnableAutoConfiguration: Tells Spring Boot to automatically configure Spring beans
 *        based on the classpath jar dependencies (e.g. DataSource, DispatcherServlet, Jackson).
 *     3. @ComponentScan: Scans the current package 'com.smarttask' and subpackages for
 *        @Component, @Service, @Repository, and @RestController annotated classes.
 */
@SpringBootApplication
public class SmartTaskApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartTaskApplication.class, args);
    }
}
