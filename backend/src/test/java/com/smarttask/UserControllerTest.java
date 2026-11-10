package com.smarttask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask.controller.UserController;
import com.smarttask.dto.CreateUserRequestDto;
import com.smarttask.dto.UserResponseDto;
import com.smarttask.enums.Role;
import com.smarttask.exception.GlobalExceptionHandler;
import com.smarttask.security.CustomUserDetailsService;
import com.smarttask.security.JwtTokenProvider;
import com.smarttask.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for UserController (Admin Employee Management).
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Tes
    @DisplayName("GET /api/users: Should return list of all users")
    void testGetAllUsers_ReturnsList() throws Exception {
        UserResponseDto dto = new UserResponseDto(2L, "Aarav Sharma", "aarav@smarttask.com", Role.EMPLOYEE, LocalDate.now());
        when(userService.getAllUsers()).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[0].name").value("Aarav Sharma"))
                .andExpect(jsonPath("$[0].email").value("aarav@smarttask.com"));
    }

    @Tes
    @DisplayName("POST /api/users: Should create user and return 201 Created")
    void testCreateUser_Success_Returns201() throws Exception {
        CreateUserRequestDto request = new CreateUserRequestDto("New Dev", "newdev@smarttask.com", "Password@123", Role.EMPLOYEE);
        UserResponseDto response = new UserResponseDto(10L, "New Dev", "newdev@smarttask.com", Role.EMPLOYEE, LocalDate.now());

        when(userService.createUser(any(CreateUserRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.name").value("New Dev"))
                .andExpect(jsonPath("$.email").value("newdev@smarttask.com"));
    }

    @Tes
    @DisplayName("POST /api/users: Should return 400 Bad Request when email already exists")
    void testCreateUser_DuplicateEmail_Returns400() throws Exception {
        CreateUserRequestDto request = new CreateUserRequestDto("Aarav Sharma", "aarav@smarttask.com", "Password@123", Role.EMPLOYEE);

        when(userService.createUser(any(CreateUserRequestDto.class)))
                .thenThrow(new IllegalArgumentException("User with email 'aarav@smarttask.com' already exists"));

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("User with email 'aarav@smarttask.com' already exists"));
    }

    @Tes
    @DisplayName("DELETE /api/users/{id}: Should return 204 No Content")
    void testDeleteUser_Returns204() throws Exception {
        doNothing().when(userService).deleteUser(2L);

        mockMvc.perform(delete("/api/users/2"))
                .andExpect(status().isNoContent());
    }
}
