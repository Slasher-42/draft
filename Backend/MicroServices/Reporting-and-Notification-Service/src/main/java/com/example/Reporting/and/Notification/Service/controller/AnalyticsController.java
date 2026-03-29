package com.example.Reporting.and.Notification.Service.controller;

import com.example.Reporting.and.Notification.Service.dto.response.AnalyticsResponse;
import com.example.Reporting.and.Notification.Service.dto.response.ApiResponse;
import com.example.Reporting.and.Notification.Service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        AnalyticsResponse analytics = notificationService.getAnalytics();
        return ResponseEntity.ok(new ApiResponse<>(true, "Analytics fetched successfully", analytics));
    }
}