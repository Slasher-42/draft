package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.EvaluatorProfileRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.model.EvaluatorProfile;
import com.example.UserManagement.MicroService.service.EvaluatorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluator")
public class EvaluatorProfileController {

    private final EvaluatorProfileService evaluatorProfileService;

    public EvaluatorProfileController(EvaluatorProfileService evaluatorProfileService) {
        this.evaluatorProfileService = evaluatorProfileService;
    }

    @PostMapping("/profile/{userId}")
    @PreAuthorize("hasRole('EVALUATOR')")
    public ResponseEntity<ApiResponse<EvaluatorProfile>> createOrUpdateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody EvaluatorProfileRequest request) {
        EvaluatorProfile profile = evaluatorProfileService.createOrUpdateProfile(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Evaluator profile saved successfully", profile));
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('EVALUATOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EvaluatorProfile>> getProfile(@PathVariable Long userId) {
        EvaluatorProfile profile = evaluatorProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Evaluator profile fetched successfully", profile));
    }
}