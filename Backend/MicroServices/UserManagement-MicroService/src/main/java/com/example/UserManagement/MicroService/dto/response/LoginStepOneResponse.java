package com.example.UserManagement.MicroService.dto.response;

import lombok.Data;

@Data
public class LoginStepOneResponse {

    private boolean requiresTwoFactor;
    private String  email;
    private String  message;

    private String  accessToken;
    private String  refreshToken;
    private String  role;
    private Long    userId;
    private String  trustedDeviceToken;

    public LoginStepOneResponse(boolean requiresTwoFactor, String email, String message) {
        this.requiresTwoFactor = requiresTwoFactor;
        this.email             = email;
        this.message           = message;
    }

    public LoginStepOneResponse(String email, String accessToken, String refreshToken,
                                String role, Long userId) {
        this.requiresTwoFactor = false;
        this.email             = email;
        this.message           = "Login successful";
        this.accessToken       = accessToken;
        this.refreshToken      = refreshToken;
        this.role              = role;
        this.userId            = userId;
    }
}