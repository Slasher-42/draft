package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.ChangePasswordRequest;
import com.example.UserManagement.MicroService.dto.request.UpdateUserRequest;
import com.example.UserManagement.MicroService.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllUsers();
    List<UserResponse> getUsersByRole(String role);
    List<UserResponse> searchUsers(String query, String role);
    UserResponse updateUser(Long id, UpdateUserRequest request, String callerEmail);
    void changePassword(Long id, ChangePasswordRequest request, String callerEmail);
    void toggleUserStatus(Long id);
    void deleteUser(Long id);
    UserResponse uploadProfilePicture(Long userId, MultipartFile file) throws IOException;
}