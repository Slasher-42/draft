package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.StartupProfileRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.model.StartupProfile;
import com.example.UserManagement.MicroService.service.StartupProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/startup")
public class StartupProfileController {

    private final StartupProfileService startupProfileService;

    public StartupProfileController(StartupProfileService startupProfileService) {
        this.startupProfileService = startupProfileService;
    }

    @PostMapping("/profile/{userId}")
    @PreAuthorize("hasRole('STARTUP')")
    public ResponseEntity<ApiResponse<StartupProfile>> createOrUpdateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody StartupProfileRequest request) {
        StartupProfile profile = startupProfileService.createOrUpdateProfile(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Startup profile saved successfully", profile));
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('STARTUP') or hasRole('ADMIN') or hasRole('EVALUATOR')")
    public ResponseEntity<ApiResponse<StartupProfile>> getProfile(@PathVariable Long userId) {
        StartupProfile profile = startupProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Startup profile fetched successfully", profile));
    }
}