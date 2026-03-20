package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.EvaluatorProfileRequest;
import com.example.UserManagement.MicroService.model.EvaluatorProfile;

public interface EvaluatorProfileService {
    EvaluatorProfile createOrUpdateProfile(Long userId, EvaluatorProfileRequest request);
    EvaluatorProfile getProfileByUserId(Long userId);
}