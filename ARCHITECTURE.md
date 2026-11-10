# SmartTask – Architecture & Technical Design Documen

This document provides architectural diagrams, database schema details, and design decisions for the SmartTask system.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph Client ["Frontend Client (React 19 + Vite)"]
        UI[Dashboard UI Components]
        FilterComp[Search & Filter Controls]
        ModalComp[Task Add / Edit Modal]
        ConsoleComp[Live REST API Console]
        ApiClient[taskApi Service Layer]
    end

    subgraph ReverseProxy ["Dev Server Proxy"]
        ViteProxy[Vite Proxy /api<br/>Port 3000 -> 8085]
    end

    subgraph SpringBoot ["Backend Application (Spring Boot 3.5.16 on Port 8085)"]
        Tomcat[Embedded Apache Tomcat]
        Dispatcher[DispatcherServlet]

        subgraph WebLayer ["Presentation Layer"]
            CORS[CorsConfig / WebMvcConfigurer]
            Controller[TaskController]
            ExceptionAdvice[GlobalExceptionHandler<br/>@RestControllerAdvice]
            Validator[Jakarta Bean Validation<br/>@Valid, @NotBlank, @Size]
        end

        subgraph ServiceLayer ["Business Logic Layer"]
            ServiceInterface[TaskService Interface]
            ServiceImpl[TaskServiceImpl<br/>@Transactional]
            DtoMapper[Entity <-> DTO Mapping]
        end

        subgraph DataLayer ["Data Access Layer"]
            Repo[TaskRepository<br/>Spring Data JpaRepository]
            Hibernate[Hibernate ORM Engine]
            Initializer[DataInitializer<br/>CommandLineRunner]
        end
    end

    subgraph DatabaseEngine ["Persistence Engine"]
        H2[(H2 In-Memory Database<br/>jdbc:h2:mem:smarttaskdb)]
        MySQL[(Optional MySQL Database<br/>jdbc:mysql://localhost:3306/smarttask_db)]
    end

    %% Connections
    UI --> ApiClien
    FilterComp --> ApiClien
    ModalComp --> ApiClien
    ConsoleComp --> ApiClien
    ApiClient <-->|HTTP JSON| ViteProxy
    ViteProxy <--> Tomca
    Tomcat --> Dispatcher
    Dispatcher --> CORS
    CORS --> Controller
    Controller --> Validator
    Controller --> ServiceInterface
    ServiceInterface --> ServiceImpl
    ServiceImpl --> DtoMapper
    ServiceImpl --> Repo
    Repo --> Hibernate
    Hibernate <--> H2
    Hibernate -.-> MySQL
    Initializer --> ServiceInterface
    Controller -.->|Uncaught Errors| ExceptionAdvice


---

## 2. Sequence Diagram: Task Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee / User
    participant React as React Modal Componen
    participant Api as taskApi Client (fetch)
    participant Spring as DispatcherServlet & TaskController
    participant Validator as Hibernate Validator
    participant Service as TaskServiceImpl (@Transactional)
    participant Repo as TaskRepository
    participant DB as H2 / MySQL Database

    Employee->>React: Fills form & clicks "Create Task"
    React->>Api: createTask(taskFormData)
    Api->>Spring: POST /api/tasks (JSON Payload)
    Spring->>Validator: Validate @Valid TaskRequestDto
    alt Validation Fails (@NotBlank, @Size)
        Validator-->>Spring: MethodArgumentNotValidException
        Spring-->>Api: HTTP 400 Bad Request + fieldErrors Map
        Api-->>React: Display red field errors
    else Validation Passes
        Spring->>Service: createTask(dto)
        Service->>Service: Map DTO to Task Entity (set createdDate = now())
        Service->>Repo: save(task)
        Repo->>DB: INSERT INTO tasks (title, description, priority, status, assignee_name, ...)
        DB-->>Repo: Returns auto-generated ID (e.g. #9)
        Repo-->>Service: Returns persisted Task entity
        Service->>Service: Map Task entity to TaskResponseDto (compute overdue status)
        Service-->>Spring: TaskResponseDto
        Spring-->>Api: HTTP 201 Created + JSON Response
        Api-->>React: Updates state & triggers success toas
        React-->>Employee: Card appears in dashboard
    end


---

## 3. Relational Database Schema (`tasks` Table)

```mermaid
erDiagram
    TASKS {
        bigint id PK "GENERATED ALWAYS AS IDENTITY"
        varchar(100) title "NOT NULL"
        varchar(1000) description "NULLABLE"
        varchar(20) priority "NOT NULL, CHECK IN ('LOW','MEDIUM','HIGH')"
        varchar(20) status "NOT NULL, CHECK IN ('TODO','IN_PROGRESS','COMPLETED')"
        date due_date "NULLABLE"
        date created_date "NOT NULL"
        varchar(60) assignee_name "NOT NULL"
    }


### Column Specifications:
- `id` (BIGINT, Primary Key): Auto-incrementing identifier (`GenerationType.IDENTITY`).
- `title` (VARCHAR 100, NOT NULL): The subject/summary of the task. Validated between 3 and 100 characters.
- `description` (VARCHAR 1000): Detailed task requirements and acceptance criteria.
- `priority` (VARCHAR 20, NOT NULL): Enum mapped as string (`LOW`, `MEDIUM`, `HIGH`).
- `status` (VARCHAR 20, NOT NULL): Enum mapped as string (`TODO`, `IN_PROGRESS`, `COMPLETED`).
- `due_date` (DATE): Target completion deadline. Used by business logic to compute `isOverdue`.
- `created_date` (DATE, NOT NULL): Creation date populated automatically via `@PrePersist`.
- `assignee_name` (VARCHAR 60, NOT NULL): Name of employee responsible for the task.

---

## 4. Design Patterns Used in SmartTask

1. **Layered Architecture Pattern**: Strict separation between Presentation (Web), Domain/Business (Service), and Data Access (Repository).
2. **Data Transfer Object (DTO) Pattern**: Isolates internal database entity representation from network serialization and API contracts.
3. **Dependency Injection (Inversion of Control)**: Loose coupling achieved by injecting interfaces into constructors without hardcoding dependencies.
4. **Front Controller Pattern**: Implemented by Spring's `DispatcherServlet` to centralize request routing, exception handling, and view resolution.
5. **Repository Pattern**: Abstracted database access through `JpaRepository` interface methods.
6. **Controller Advice (AOP / Interceptor Pattern)**: `@RestControllerAdvice` centralizes exception handling across all endpoints via Aspect-Oriented Programming principles.
