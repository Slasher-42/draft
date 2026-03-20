package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.StartupProfileRequest;
import com.example.UserManagement.MicroService.model.StartupProfile;

public interface StartupProfileService {
    StartupProfile createOrUpdateProfile(Long userId, StartupProfileRequest request);
    StartupProfile getProfileByUserId(Long userId);
}