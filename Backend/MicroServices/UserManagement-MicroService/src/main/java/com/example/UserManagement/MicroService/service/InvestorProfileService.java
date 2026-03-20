package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.InvestorProfileRequest;
import com.example.UserManagement.MicroService.model.InvestorProfile;

public interface InvestorProfileService {
    InvestorProfile createOrUpdateProfile(Long userId, InvestorProfileRequest request);
    InvestorProfile getProfileByUserId(Long userId);
}