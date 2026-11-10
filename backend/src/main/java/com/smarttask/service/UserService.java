package com.smarttask.service;

import com.smarttask.dto.CreateUserRequestDto;
import com.smarttask.dto.UserResponseDto;

import java.util.List;

public interface UserService {

    UserResponseDto createUser(CreateUserRequestDto request);

    List<UserResponseDto> getAllUsers();

    UserResponseDto getUserById(Long id);

    UserResponseDto getUserByEmail(String email);

    void deleteUser(Long id);
}
