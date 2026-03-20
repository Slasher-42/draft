package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.InvestorProfileRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.model.InvestorProfile;
import com.example.UserManagement.MicroService.service.InvestorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investor")
public class InvestorProfileController {

    private final InvestorProfileService investorProfileService;

    public InvestorProfileController(InvestorProfileService investorProfileService) {
        this.investorProfileService = investorProfileService;
    }

    @PostMapping("/profile/{userId}")
    @PreAuthorize("hasRole('INVESTOR')")
    public ResponseEntity<ApiResponse<InvestorProfile>> createOrUpdateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody InvestorProfileRequest request) {
        InvestorProfile profile = investorProfileService.createOrUpdateProfile(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Investor profile saved successfully", profile));
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('INVESTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvestorProfile>> getProfile(@PathVariable Long userId) {
        InvestorProfile profile = investorProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Investor profile fetched successfully", profile));
    }
}