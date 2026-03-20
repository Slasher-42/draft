package com.example.UserManagement.MicroService.security;

import com.example.UserManagement.MicroService.dto.request.LoginRequest;
import com.example.UserManagement.MicroService.dto.response.LoginStepOneResponse;
import com.example.UserManagement.MicroService.model.RefreshToken;
import com.example.UserManagement.MicroService.model.User;
import com.example.UserManagement.MicroService.repository.RefreshTokenRepository;
import com.example.UserManagement.MicroService.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private static final String TRUSTED_DEVICE_HEADER = "X-Trusted-Device";

    private final AuthenticationManager  authenticationManager;
    private final JwtUtil                jwtUtil;
    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserDetailsService     userDetailsService;
    private final TransactionTemplate    transactionTemplate;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager,
                                   JwtUtil jwtUtil,
                                   UserRepository userRepository,
                                   RefreshTokenRepository refreshTokenRepository,
                                   UserDetailsService userDetailsService,
                                   PlatformTransactionManager transactionManager) {
        this.authenticationManager  = authenticationManager;
        this.jwtUtil                = jwtUtil;
        this.userRepository         = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userDetailsService     = userDetailsService;
        this.transactionTemplate    = new TransactionTemplate(transactionManager);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {
        try {
            LoginRequest loginRequest = new ObjectMapper().readValue(request.getInputStream(), LoginRequest.class);

            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

            if (user != null && user.isAccountLocked()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Account is temporarily locked due to multiple failed attempts. Please try again later.\",\"data\":null}");
                return null;
            }

            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult) throws IOException {
        UserDetails userDetails = (UserDetails) authResult.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Your account has been disabled. Please contact support.\",\"data\":null}");
            return;
        }

        final User finalUser = user;

        transactionTemplate.execute(status -> {
            finalUser.setFailedLoginAttempts(0);
            finalUser.setAccountLockedUntil(null);
            userRepository.save(finalUser);
            return null;
        });

        String incomingTrustedToken = request.getHeader(TRUSTED_DEVICE_HEADER);
        if (incomingTrustedToken != null && user.hasTrustedDevice(incomingTrustedToken)) {

            String accessToken     = jwtUtil.generateToken(userDetails, user.getId());
            String newTrustedToken = UUID.randomUUID().toString();

            LoginStepOneResponse directLogin = transactionTemplate.execute(status -> {
                refreshTokenRepository.deleteByUserId(finalUser.getId());

                RefreshToken refreshToken = new RefreshToken();
                refreshToken.setToken(UUID.randomUUID().toString());
                refreshToken.setUser(finalUser);
                refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
                refreshTokenRepository.save(refreshToken);

                finalUser.setTrustedDeviceToken(newTrustedToken);
                finalUser.setTrustedDeviceExpiry(LocalDateTime.now().plusDays(30));
                userRepository.save(finalUser);

                String role = "ROLE_" + finalUser.getRole().getName().name();
                LoginStepOneResponse resp = new LoginStepOneResponse(
                        finalUser.getEmail(), accessToken, refreshToken.getToken(), role, finalUser.getId());
                resp.setTrustedDeviceToken(newTrustedToken);
                return resp;
            });

            response.setContentType("application/json");
            response.getWriter().write(new ObjectMapper().writeValueAsString(directLogin));
            return;
        }

        LoginStepOneResponse stepOne = new LoginStepOneResponse(
                true,
                user.getEmail(),
                "Credentials verified. A verification code has been sent to your email.");

        response.setContentType("application/json");
        response.getWriter().write(new ObjectMapper().writeValueAsString(stepOne));
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed) throws IOException {
        String email = "";
        try {
            LoginRequest loginRequest = new ObjectMapper().readValue(request.getInputStream(), LoginRequest.class);
            email = loginRequest.getEmail();
        } catch (Exception ignored) {}

        if (!email.isBlank()) {
            final String finalEmail = email;
            transactionTemplate.execute(status -> {
                User user = userRepository.findByEmail(finalEmail).orElse(null);
                if (user != null) {
                    int attempts = user.getFailedLoginAttempts() + 1;
                    user.setFailedLoginAttempts(attempts);
                    if (attempts >= 5) {
                        user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
                    }
                    userRepository.save(user);
                }
                return null;
            });

            User locked = userRepository.findByEmail(email).orElse(null);
            if (locked != null && locked.getFailedLoginAttempts() >= 5) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Too many failed attempts. Account locked for 15 minutes.\",\"data\":null}");
                return;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"Invalid email or password\",\"data\":null}");
    }
}