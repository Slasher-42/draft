package com.example.UserManagement.MicroService.dto.response;

import lombok.Data;

@Data
public class FullAuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
    private Long   userId;
    private String trustedDeviceToken;

    public FullAuthResponse(String accessToken, String refreshToken,
                            String email, String role, Long userId) {
        this.accessToken  = accessToken;
        this.refreshToken = refreshToken;
        this.email        = email;
        this.role         = role;
        this.userId       = userId;
    }

    public FullAuthResponse(String accessToken, String refreshToken, String email,
                            String role, Long userId, String trustedDeviceToken) {
        this(accessToken, refreshToken, email, role, userId);
        this.trustedDeviceToken = trustedDeviceToken;
    }
}