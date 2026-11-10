# SmartTask – Employee Task Management System

A full-stack employee task management application built with **Java 17 LTS**, **Spring Boot 3.5**, **Spring Security**, **stateless JWT authentication**, **Spring Data JPA**, and **React 19**.

> **Demo app:** Included accounts and sample data are for local evaluation only. Never reuse demo credentials or deploy them as production accounts.

---

## 🎯 Project Overview

SmartTask is an enterprise 3-tier employee task management system designed to enforce strict Role-Based Access Control (RBAC). It enables organizations to distribute, monitor, prioritize, and track tasks across engineering teams with cryptographically secured credentials, role-appropriate views, and complete backend data isolation.

### Key Capabilities
- **Spring Security & Stateless JWT**: Token-based authentication using HMAC-SHA512 signatures and BCrypt password hashing (strength 10).
- **Role-Based Authorization (RBAC)**: Distinct permissions for `ADMIN` and `EMPLOYEE` roles enforced via `@PreAuthorize` and service checks.
- **Strict Data Isolation**: Employees can only view and update tasks assigned to them; tampering with IDs in the URL returns `403 Forbidden`.
- **Team Management**: Admins can provision new employee accounts, assign work, and monitor organizational velocity.
- **Interactive Views**: Kanban board, Due-Date Calendar, Filterable Task Table, and Executive Dashboard.

---

## 🔑 Pre-Seeded Demo Credentials

The application seeds initial users upon startup for zero-configuration local development:

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Admin User | `admin@smarttask.com` | `Admin@123` | Full Access (All Tasks, Create/Edit/Delete, Employee Management) |
| **EMPLOYEE** | Aarav Sharma | `aarav@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only, Status updates, Personal Board) |
| **EMPLOYEE** | Priya Patel | `priya@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only, Status updates, Personal Board) |
| **EMPLOYEE** | Rohan Verma | `rohan@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only) |
| **EMPLOYEE** | Neha Gupta | `neha@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only) |
| **EMPLOYEE** | Vikram Singh | `vikram@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only) |
| **EMPLOYEE** | Ananya Iyer | `ananya@smarttask.com` | `Employee@123` | Isolated (Assigned tasks only) |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Feature / Endpoint | Method | Public | EMPLOYEE | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Authenticate / Login (`/api/auth/login`) | POST | ✅ | ✅ | ✅ |
| Current User Profile (`/api/auth/me`) | GET | ❌ | ✅ | ✅ |
| View Assigned Tasks (`/api/tasks`) | GET | ❌ | ✅ (Own Only) | ✅ (All Tasks) |
| View Single Task (`/api/tasks/{id}`) | GET | ❌ | ✅ (If Assigned) | ✅ |
| Update Task Status (`/api/tasks/{id}/status`) | PATCH | ❌ | ✅ (If Assigned) | ✅ |
| Create & Assign Task (`/api/tasks`) | POST | ❌ | ❌ (403 Forbidden) | ✅ |
| Edit Task Details (`/api/tasks/{id}`) | PUT | ❌ | ❌ (403 Forbidden) | ✅ |
| Delete Task (`/api/tasks/{id}`) | DELETE | ❌ | ❌ (403 Forbidden) | ✅ |
| View Employee Directory (`/api/users`) | GET | ❌ | ❌ (403 Forbidden) | ✅ |
| Create Employee Account (`/api/users`) | POST | ❌ | ❌ (403 Forbidden) | ✅ |
| Delete User Account (`/api/users/{id}`) | DELETE | ❌ | ❌ (403 Forbidden) | ✅ |
| Reset Sample Data (`/api/tasks/seed`) | POST | ❌ | ❌ (403 Forbidden) | ✅ |

---

## 🏗️ Technical Stack & Architecture


[React 19 Frontend (Vite, Tailwind CSS, Lucide)]
          |
          |  Bearer <JWT Token> (HMAC-SHA512)
          v
[Spring Boot 3.5.16 Embedded Tomcat (Port 8085)]
          |
    [Security Filter Chain]
    - CorsFilter (Allow Vite origin)
    - JwtAuthenticationFilter (Extract Bearer token & validate)
    - UsernamePasswordAuthenticationFilter
    - ExceptionTranslationFilter (Custom 401 / 403 JSON handlers)
          |
    [Controller Layer (@RestController, @PreAuthorize)]
    - AuthController (/api/auth)
    - UserController (/api/users - Admin only)
    - TaskController (/api/tasks - Authenticated)
          |
    [Service Layer (@Service, @Transactional)]
    - AuthServiceImpl (BCrypt password verification, JWT generation)
    - UserServiceImpl (Employee provisioning & hashing)
    - TaskServiceImpl (RBAC isolation & URL tampering protection)
          |
    [Repository Layer (Spring Data JPA, Hibernate)]
    - UserRepository (findByEmail, existsByEmail)
    - TaskRepository (filterTasksForEmployee, countForEmployee)
          |
    [Database]
    - H2 In-Memory Database (Zero-config development)
    - MySQL 8.x (Production profile)


---

## 🚀 Running the Project Locally

### Prerequisites
- **Java 17 JDK** (`java -version`)
- **Apache Maven 3.8+** (`mvn -version`)
- **Node.js 20.19+** and npm (`node -v` and `npm -v`). Vite 8 does not support Node 18.
- **Visual Studio Code** (recommended for the steps below)

Install Java 17 from [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=17) or [Oracle](https://www.oracle.com/java/technologies/downloads/). On Windows, enable the installer options to add Java to `PATH` and set `JAVA_HOME`. Install Maven from [the official Maven site](https://maven.apache.org/download.cgi) and Node.js from [nodejs.org](https://nodejs.org/).

### VS Code extensions

Open Extensions with **Ctrl+Shift+X** (Windows/Linux) or **Cmd+Shift+X** (macOS), then install:

- **Extension Pack for Java** by Microsof
- **Spring Boot Extension Pack** by VMware
- *(Optional)* **Prettier - Code formatter**

The workspace recommends the two Java extension packs in `.vscode/extensions.json`. After opening the project, allow the Java Language Server to import and index the Maven backend.

### Run the project in VS Code

1. In VS Code, choose **File → Open Folder...** and open the `smarttask` project root.
2. Open a terminal with **Ctrl+`** (Windows/Linux) or **Terminal → New Terminal**.
3. In Terminal 1, build, test, and start the backend:

   ```powershell
   cd backend
   $bytes = New-Object byte[] 64
   [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
   mvn clean tes
   mvn spring-boot:run


   The test suite should report **BUILD SUCCESS** with 27 tests passing. `JWT_SECRET` is required and must contain at least 32 bytes; generate a new value locally before starting the backend. The backend runs at [http://localhost:8085](http://localhost:8085), and its default H2 in-memory database requires no separate database installation. The app seeds demo users and 8 tasks on startup.

   You can also use **Run** or **Debug** above `main` in `backend/src/main/java/com/smarttask/SmartTaskApplication.java`, or use the **SmartTask Backend** launch configuration in `.vscode/launch.json`.
   Set `JWT_SECRET` in the environment before launching from VS Code; the application intentionally does not contain a default signing key.

4. Keep Terminal 1 running. Open Terminal 2 at the project root and start the frontend:

   ```bash
   npm install
   npm run dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser and choose a demo profile:

   - **System Admin** — `admin@smarttask.com` / `Admin@123
   - **Aarav Sharma** — `aarav@smarttask.com` / `Employee@123
   - **Priya Patel** — `priya@smarttask.com` / `Employee@123

### H2 database console

While the backend is running, open [http://localhost:8085/h2-console](http://localhost:8085/h2-console):

| Setting | Value |
|---------|-------|
| JDBC URL | `jdbc:h2:mem:smarttaskdb` |
| User Name | `sa` |
| Password | Leave blank |

### Troubleshooting

- **`mvn` is not recognized:** Install Maven and add its `bin` directory to `PATH`, then restart VS Code.
- **`JAVA_HOME` is not set or Java is the wrong version:** Set `JAVA_HOME` to the Java 17 JDK installation directory and add its `bin` directory to `PATH`. Confirm with `java -version`.
- **Backend reports missing or weak `JWT_SECRET`:** Set a fresh, random value of at least 32 bytes in the same terminal or VS Code environment used to launch the backend. Do not commit the value or share it.
- **Port 8085 is already in use:** Change `server.port` in `backend/src/main/resources/application.properties` (for example, to `8086`) and update the `/api` proxy target in `vite.config.ts` to `http://localhost:8086`.
- **Port 3000 is already in use:** Stop the other process using the port or use the alternate local URL printed by Vite.

### Run with MySQL (optional)

To use MySQL instead of the default H2 database:
1. Create a MySQL database: `CREATE DATABASE smarttaskdb;
2. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` for your environment (for example, `jdbc:mysql://localhost:3306/smarttaskdb`). The MySQL profile does not use a default database username, password, or JWT signing key.
3. Start the backend with the MySQL profile: `mvn spring-boot:run -Dspring-boot.run.profiles=mysql`.

---

## 🧪 Automated Test Suite (27 Tests Passing)

All business rules and security policies are tested with JUnit 5 and Mockito:

1. **`TaskServiceTest`**:
   - `testCreateTask_Admin_Success`: Verifies Admin can create tasks.
   - `testCreateTask_Employee_ThrowsAccessDenied`: Verifies Employee creating tasks throws `AccessDeniedException`.
   - `testGetTaskById_Employee_OtherTask_ThrowsAccessDenied`: Verifies URL tampering protection (changing ID in URL throws 403).
   - `testPatchTaskStatus_Employee_OwnTask_Success`: Verifies employee can update own task status.
   - `testPatchTaskStatus_Employee_OtherTask_ThrowsAccessDenied`: Verifies employee cannot modify other employee tasks.
   - `testDeleteTask_Employee_ThrowsAccessDenied`: Verifies employee cannot delete tasks.
   - `testGetDashboardSummary_Admin_Success`: Verifies organizational dashboard aggregation.
2. **`AuthControllerTest`**:
   - `POST /api/auth/login`: Valid credentials return 200 OK + JWT.
   - `POST /api/auth/login`: Invalid credentials return 401 Unauthorized.
   - `POST /api/auth/login`: Malformed input returns 400 Bad Request.
   - `GET /api/auth/me`: Returns current user profile.
3. **`UserControllerTest`**:
   - `GET /api/users`: Returns employee directory.
   - `POST /api/users`: Creates new user account.
   - `POST /api/users`: Duplicate email returns 400 Bad Request.
   - `DELETE /api/users/{id}`: Deletes user.
4. **`TaskControllerTest`**:
   - `GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks/{id}`, `GET /api/tasks/dashboard`.
