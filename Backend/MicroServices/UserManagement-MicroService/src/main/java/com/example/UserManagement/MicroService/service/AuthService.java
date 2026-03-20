package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.RegisterRequest;
import com.example.UserManagement.MicroService.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
}