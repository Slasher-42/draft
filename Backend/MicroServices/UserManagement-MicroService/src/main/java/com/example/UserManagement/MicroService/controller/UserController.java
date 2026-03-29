package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.ChangePasswordRequest;
import com.example.UserManagement.MicroService.dto.request.UpdateUserRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.dto.response.UserResponse;
import com.example.UserManagement.MicroService.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse userResponse = userService.getUserById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", userResponse));
    }

    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@RequestParam String email) {
        UserResponse userResponse = userService.getUserByEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", userResponse));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String role) {
        List<UserResponse> users = (role != null && !role.isBlank())
                ? userService.getUsersByRole(role)
                : userService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", users));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse updated = userService.updateUser(id, request, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updated));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.changePassword(id, request, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User status updated", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        UserResponse response = userService.uploadProfilePicture(id, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile picture updated", response));
    }

    @GetMapping("/internal/evaluator-ids")
    public ResponseEntity<List<Long>> getEvaluatorIds() {
        List<Long> ids = userService.getUsersByRole("EVALUATOR")
                .stream()
                .filter(UserResponse::isEnabled)
                .map(UserResponse::getId)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ids);
    }
}