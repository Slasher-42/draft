package com.example.Reporting.and.Notification.Service.service;

import com.example.Reporting.and.Notification.Service.dto.response.AnalyticsResponse;
import com.example.Reporting.and.Notification.Service.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getMyNotifications(Long userId);

    List<NotificationResponse> getMyUnreadNotifications(Long userId);

    List<NotificationResponse> getAllNotifications();

    NotificationResponse markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    long countUnread(Long userId);

    AnalyticsResponse getAnalytics();
}