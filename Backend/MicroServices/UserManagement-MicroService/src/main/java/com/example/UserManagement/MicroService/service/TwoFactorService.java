package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.response.FullAuthResponse;

public interface TwoFactorService {
    void sendCode(String email);
    FullAuthResponse verifyCode(String email, String code);
    FullAuthResponse verifyCodeAndTrust(String email, String code);
}