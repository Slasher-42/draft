package com.example.Reporting.and.Notification.Service.controller;

import com.example.Reporting.and.Notification.Service.dto.request.AskForFundRequest;
import com.example.Reporting.and.Notification.Service.dto.response.ApiResponse;
import com.example.Reporting.and.Notification.Service.dto.response.NotificationResponse;
import com.example.Reporting.and.Notification.Service.dto.response.TokenValidationResponse;
import com.example.Reporting.and.Notification.Service.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final WebClient.Builder webClientBuilder;

    @Value("${services.user-management.url}")
    private String userManagementUrl;

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_STARTUP', 'ROLE_INVESTOR', 'ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<NotificationResponse> notifications = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched successfully", notifications));
    }

    @GetMapping("/my/unread")
    @PreAuthorize("hasAnyAuthority('ROLE_STARTUP', 'ROLE_INVESTOR', 'ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyUnreadNotifications(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<NotificationResponse> notifications = notificationService.getMyUnreadNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread notifications fetched successfully", notifications));
    }

    @GetMapping("/my/unread/count")
    @PreAuthorize("hasAnyAuthority('ROLE_STARTUP', 'ROLE_INVESTOR', 'ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countUnread(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count fetched successfully", count));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications() {
        List<NotificationResponse> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications fetched successfully", notifications));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_STARTUP', 'ROLE_INVESTOR', 'ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        NotificationResponse updated = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", updated));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_STARTUP', 'ROLE_INVESTOR', 'ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read", null));
    }

    @PostMapping("/ask-for-fund")
    public ResponseEntity<ApiResponse<NotificationResponse>> askForFund(
            @Valid @RequestBody AskForFundRequest request) {
        // Marker log line — search Render logs for "ASK-FOR-FUND-V2-HIT" to confirm
        // this build is actually live and the request reaches this controller at all.
        log.info("ASK-FOR-FUND-V2-HIT investorUserId={} executionId={} hasToken={}",
                request.getInvestorUserId(), request.getExecutionId(), StringUtils.hasText(request.getToken()));

        // Render strips the Authorization/X-Token headers before they reach this service
        // (confirmed via diagnostics — the JwtAuthFilter never sees a token), so this
        // endpoint is permitAll and validates the JWT carried in the request body instead.
        String token = request.getToken();
        if (!StringUtils.hasText(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Unauthorized", null));
        }

        TokenValidationResponse validation;
        try {
            ApiResponse<TokenValidationResponse> result = webClientBuilder.build()
                    .get()
                    .uri(userManagementUrl + "/api/auth/validate")
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<TokenValidationResponse>>() {})
                    .timeout(Duration.ofSeconds(60))
                    .block();
            validation = (result != null) ? result.getData() : null;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiResponse<>(false, "Authentication service unavailable, please try again in a moment", null));
        }

        if (validation == null || !validation.isValid()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Token invalid or expired", null));
        }

        String role = validation.getRole();
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_EVALUATOR".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You don't have permission to send fund requests", null));
        }

        NotificationResponse response = notificationService.createFundRequestNotification(request);
        return ResponseEntity.ok(new ApiResponse<>(true,
                "Fund request notification sent to " + request.getInvestorName(), response));
    }
}