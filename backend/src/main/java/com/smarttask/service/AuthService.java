package com.smarttask.service;

import com.smarttask.dto.AuthResponseDto;
import com.smarttask.dto.LoginRequestDto;
import com.smarttask.dto.UserResponseDto;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto request);

    UserResponseDto getCurrentUser();
}
