package com.example.UserManagement.MicroService.mapper;

import com.example.UserManagement.MicroService.dto.response.UserResponse;
import com.example.UserManagement.MicroService.model.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole("ROLE_" + user.getRole().getName().name());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        return response;
    }
}