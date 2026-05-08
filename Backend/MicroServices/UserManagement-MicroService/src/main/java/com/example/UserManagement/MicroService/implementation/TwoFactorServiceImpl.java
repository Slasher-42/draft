package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.response.FullAuthResponse;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.exception.UnauthorizedException;
import com.example.UserManagement.MicroService.model.RefreshToken;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.RefreshTokenRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.security.JwtUtil;
import com.example.UserManagement.MicroService.service.TwoFactorService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class TwoFactorServiceImpl implements TwoFactorService {

    private static final int TRUSTED_DEVICE_DAYS = 30;

    @Value("${resend.api.key}")
    private String resendApiKey;

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil                jwtUtil;
    private final UserDetailsService     userDetailsService;

    public TwoFactorServiceImpl(UserRepository userRepository,
                                RefreshTokenRepository refreshTokenRepository,
                                JwtUtil jwtUtil,
                                UserDetailsService userDetailsService) {
        this.userRepository         = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil                = jwtUtil;
        this.userDetailsService     = userDetailsService;
    }

    private void sendEmail(String to, String subject, String text) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", "RG Partners <onboarding@resend.dev>");
        body.put("to", List.of(to));
        body.put("subject", subject);
        body.put("text", text);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForObject("https://api.resend.com/emails", request, String.class);
    }

    @Override
    public void sendCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String code = String.format("%06d", new Random().nextInt(999999));
        user.setTwoFactorCode(code);
        user.setTwoFactorCodeExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        sendEmail(
            email,
            "RG Partners — Your verification code",
            "Your verification code is: " + code +
            "\n\nThis code expires in 10 minutes." +
            "\n\nIf you did not request this, please ignore this email."
        );
    }

    @Override
    @Transactional
    public FullAuthResponse verifyCode(String email, String code) {
        return doVerify(email, code, false);
    }

    @Override
    @Transactional
    public FullAuthResponse verifyCodeAndTrust(String email, String code) {
        return doVerify(email, code, true);
    }

    private FullAuthResponse doVerify(String email, String code, boolean trustDevice) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getTwoFactorCode() == null || user.getTwoFactorCodeExpiry() == null) {
            throw new UnauthorizedException("No verification code was requested. Please log in again.");
        }

        if (LocalDateTime.now().isAfter(user.getTwoFactorCodeExpiry())) {
            user.setTwoFactorCode(null);
            user.setTwoFactorCodeExpiry(null);
            userRepository.save(user);
            throw new UnauthorizedException("Verification code has expired. Please log in again.");
        }

        if (!user.getTwoFactorCode().equals(code)) {
            throw new UnauthorizedException("Invalid verification code.");
        }

        user.setTwoFactorCode(null);
        user.setTwoFactorCodeExpiry(null);

        String trustedToken = null;
        if (trustDevice) {
            trustedToken = UUID.randomUUID().toString();
            user.setTrustedDeviceToken(trustedToken);
            user.setTrustedDeviceExpiry(LocalDateTime.now().plusDays(TRUSTED_DEVICE_DAYS));
        }

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String accessToken = jwtUtil.generateToken(userDetails, user.getId());

        refreshTokenRepository.deleteByUserId(user.getId());
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshToken);

        String role = "ROLE_" + user.getRole().getName().name();

        return new FullAuthResponse(accessToken, refreshToken.getToken(), email, role, user.getId(), trustedToken);
    }
}