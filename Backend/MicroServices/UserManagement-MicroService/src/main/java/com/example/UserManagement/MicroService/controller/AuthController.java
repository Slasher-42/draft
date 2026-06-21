package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.*;
import com.example.UserManagement.MicroService.dto.response.*;
import com.example.UserManagement.MicroService.enums.RoleType;
import com.example.UserManagement.MicroService.exception.ResourceNotFoundException;
import com.example.UserManagement.MicroService.mapper.UserMapper;
import com.example.UserManagement.MicroService.model.RefreshToken;
import com.example.UserManagement.MicroService.model.Role;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.RefreshTokenRepository;
import com.example.UserManagement.MicroService.repository.RoleRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.example.UserManagement.MicroService.security.JwtUtil;
import com.example.UserManagement.MicroService.service.AuthService;
import com.example.UserManagement.MicroService.service.TwoFactorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${resend.api.key}")
    private String resendApiKey;

    private final AuthService            authService;
    private final JwtUtil                jwtUtil;
    private final UserDetailsService     userDetailsService;
    private final UserRepository         userRepository;
    private final TwoFactorService       twoFactorService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository         roleRepository;
    private final PasswordEncoder        passwordEncoder;

    public AuthController(AuthService authService,
                          JwtUtil jwtUtil,
                          UserDetailsService userDetailsService,
                          UserRepository userRepository,
                          TwoFactorService twoFactorService,
                          RefreshTokenRepository refreshTokenRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.authService            = authService;
        this.jwtUtil                = jwtUtil;
        this.userDetailsService     = userDetailsService;
        this.userRepository         = userRepository;
        this.twoFactorService       = twoFactorService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.roleRepository         = roleRepository;
        this.passwordEncoder        = passwordEncoder;
    }

    private void sendEmail(String to, String subject, String text) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", "RG Partners <noreply@rgpartners.xyz>");
        body.put("to", List.of(to));
        body.put("subject", subject);
        body.put("text", text);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForObject("https://api.resend.com/emails", request, String.class);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "User registered successfully", userResponse));
    }

    @PostMapping("/2fa/send")
    public ResponseEntity<ApiResponse<Void>> sendTwoFactorCode(@RequestParam String email) {
        twoFactorService.sendCode(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Verification code sent to your email", null));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<ApiResponse<FullAuthResponse>> verifyTwoFactorCode(
            @Valid @RequestBody TwoFactorVerifyRequest request) {
        FullAuthResponse authResponse =
                twoFactorService.verifyCodeAndTrust(request.getEmail(), request.getCode());
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<FullAuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Refresh token has expired. Please log in again.", null));
        }

        User user = stored.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken   = jwtUtil.generateToken(userDetails, user.getId());
        String role             = "ROLE_" + user.getRole().getName().name();

        FullAuthResponse fullAuth = new FullAuthResponse(
                newAccessToken, stored.getToken(), user.getEmail(), role, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully", fullAuth));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", UserMapper.toResponse(user)));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<TokenValidationResponse>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Missing or invalid token", null));
        }
        String token = authHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtUtil.validateToken(token, userDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Token is invalid or expired", null));
            }
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            String role = "ROLE_" + user.getRole().getName().name();
            TokenValidationResponse body =
                    new TokenValidationResponse(true, user.getId(), email, role);
            return ResponseEntity.ok(new ApiResponse<>(true, "Token is valid", body));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Token validation failed", null));
        }
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> adminCreateUser(
            @Valid @RequestBody AdminCreateUserRequest request) {

        if (request.getRole() != RoleType.EVALUATOR && request.getRole() != RoleType.ADMIN) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Admin can only create EVALUATOR or ADMIN accounts", null));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Email already in use", null));
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setRole(role);
        user.setEnabled(true);
        userRepository.save(user);

        sendEmail(
            request.getEmail(),
            "RG Partners — Your account has been created",
            "Hello " + request.getFullName() + ",\n\n" +
            "Your account has been created on RG Partners.\n\n" +
            "Email: " + request.getEmail() + "\n" +
            "Temporary Password: " + request.getTemporaryPassword() + "\n\n" +
            "Please log in and change your password immediately."
        );

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFullName(user.getFullName());
        userResponse.setEmail(user.getEmail());
        userResponse.setRole(user.getRole().getName().name());
        userResponse.setEnabled(user.isEnabled());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "User created and credentials sent via email", userResponse));
    }
}