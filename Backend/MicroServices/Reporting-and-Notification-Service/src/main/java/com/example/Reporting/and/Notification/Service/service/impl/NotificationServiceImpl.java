package com.example.Reporting.and.Notification.Service.service.impl;

import com.example.Reporting.and.Notification.Service.dto.response.AnalyticsResponse;
import com.example.Reporting.and.Notification.Service.dto.response.NotificationResponse;
import com.example.Reporting.and.Notification.Service.model.AnalyticsSummary;
import com.example.Reporting.and.Notification.Service.model.Notification;
import com.example.Reporting.and.Notification.Service.repository.AnalyticsSummaryRepository;
import com.example.Reporting.and.Notification.Service.repository.NotificationRepository;
import com.example.Reporting.and.Notification.Service.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AnalyticsSummaryRepository analyticsRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository
                .findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getMyUnreadNotifications(Long userId) {
        return notificationRepository
                .findByRecipientUserIdAndReadFalse(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.getRecipientUserId().equals(userId)) {
            throw new RuntimeException("You are not authorized to update this notification");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.findByRecipientUserIdAndReadFalse(userId).size();
    }

    @Override
    public AnalyticsResponse getAnalytics() {
        AnalyticsSummary summary = analyticsRepository.findTopByOrderByIdAsc()
                .orElse(AnalyticsSummary.builder()
                        .totalExecutions(0)
                        .totalApproved(0)
                        .totalRejected(0)
                        .totalMatched(0)
                        .totalEscalated(0)
                        .scoreDataJson("{\"scoreByIndustry\":[],\"executionTrend\":[]}")
                        .build());

        List<AnalyticsResponse.IndustryScore> industryScores = new ArrayList<>();
        List<AnalyticsResponse.TrendEntry> trendEntries = new ArrayList<>();

        try {
            Map<String, Object> scoreData = objectMapper.readValue(
                    summary.getScoreDataJson(), Map.class);

            List<Map<String, Object>> industryList =
                    (List<Map<String, Object>>) scoreData.get("scoreByIndustry");

            if (industryList != null) {
                for (Map<String, Object> entry : industryList) {
                    industryScores.add(new AnalyticsResponse.IndustryScore(
                            (String) entry.get("industry"),
                            ((Number) entry.get("totalScore")).doubleValue(),
                            ((Number) entry.get("count")).longValue()
                    ));
                }
            }

            List<Map<String, Object>> trendList =
                    (List<Map<String, Object>>) scoreData.get("executionTrend");

            if (trendList != null) {
                for (Map<String, Object> entry : trendList) {
                    trendEntries.add(new AnalyticsResponse.TrendEntry(
                            (String) entry.get("date"),
                            ((Number) entry.get("count")).longValue()
                    ));
                }
            }

        } catch (Exception e) {
            log.error("[Analytics] Failed to parse scoreDataJson: {}", e.getMessage());
        }

        return AnalyticsResponse.builder()
                .totalExecutions(summary.getTotalExecutions())
                .totalApproved(summary.getTotalApproved())
                .totalRejected(summary.getTotalRejected())
                .totalMatched(summary.getTotalMatched())
                .totalEscalated(summary.getTotalEscalated())
                .scoreByIndustry(industryScores)
                .executionTrend(trendEntries)
                .build();
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientUserId(n.getRecipientUserId())
                .type(n.getType())
                .message(n.getMessage())
                .relatedExecutionId(n.getRelatedExecutionId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}