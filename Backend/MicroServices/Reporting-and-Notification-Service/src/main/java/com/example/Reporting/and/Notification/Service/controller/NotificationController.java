package com.example.Reporting.and.Notification.Service.controller;

import com.example.Reporting.and.Notification.Service.dto.response.ApiResponse;
import com.example.Reporting.and.Notification.Service.dto.response.NotificationResponse;
import com.example.Reporting.and.Notification.Service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

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
}