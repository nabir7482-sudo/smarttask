package com.smarttask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask.controller.AuthController;
import com.smarttask.dto.AuthResponseDto;
import com.smarttask.dto.LoginRequestDto;
import com.smarttask.dto.UserResponseDto;
import com.smarttask.enums.Role;
import com.smarttask.exception.GlobalExceptionHandler;
import com.smarttask.security.CustomUserDetailsService;
import com.smarttask.security.JwtTokenProvider;
import com.smarttask.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for AuthController.
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Tes
    @DisplayName("POST /api/auth/login: Should return 200 OK and JWT token on valid credentials")
    void testLogin_Success() throws Exception {
        LoginRequestDto request = new LoginRequestDto("admin@smarttask.com", "Admin@123");
        UserResponseDto userDto = new UserResponseDto(1L, "System Admin", "admin@smarttask.com", Role.ADMIN, LocalDate.now());
        AuthResponseDto responseDto = new AuthResponseDto("mock-jwt-token-xyz", userDto);

        when(authService.login(any(LoginRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token-xyz"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("admin@smarttask.com"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Tes
    @DisplayName("POST /api/auth/login: Should return 401 Unauthorized on invalid credentials")
    void testLogin_InvalidCredentials_Returns401() throws Exception {
        LoginRequestDto request = new LoginRequestDto("admin@smarttask.com", "WrongPassword");

        when(authService.login(any(LoginRequestDto.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Tes
    @DisplayName("POST /api/auth/login: Should return 400 Bad Request on invalid email format")
    void testLogin_InvalidEmail_Returns400() throws Exception {
        LoginRequestDto request = new LoginRequestDto("not-an-email", "");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Tes
    @DisplayName("GET /api/auth/me: Should return current user profile")
    void testGetCurrentUser_Success() throws Exception {
        UserResponseDto userDto = new UserResponseDto(1L, "System Admin", "admin@smarttask.com", Role.ADMIN, LocalDate.now());
        when(authService.getCurrentUser()).thenReturn(userDto);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@smarttask.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
