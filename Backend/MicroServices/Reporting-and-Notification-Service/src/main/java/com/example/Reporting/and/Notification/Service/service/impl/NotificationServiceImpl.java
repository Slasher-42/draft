package com.example.Reporting.and.Notification.Service.service.impl;

import com.example.Reporting.and.Notification.Service.dto.request.AskForFundRequest;
import com.example.Reporting.and.Notification.Service.dto.request.WithholdNoticeRequest;
import com.example.Reporting.and.Notification.Service.dto.response.AnalyticsResponse;
import com.example.Reporting.and.Notification.Service.dto.response.NotificationResponse;
import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import com.example.Reporting.and.Notification.Service.model.AnalyticsSummary;
import com.example.Reporting.and.Notification.Service.model.Notification;
import com.example.Reporting.and.Notification.Service.repository.AnalyticsSummaryRepository;
import com.example.Reporting.and.Notification.Service.repository.NotificationRepository;
import com.example.Reporting.and.Notification.Service.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
    @CacheEvict(value = "unread-count", key = "#userId")
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
    @CacheEvict(value = "unread-count", key = "#userId")
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Cacheable(value = "unread-count", key = "#userId")
    public long countUnread(Long userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
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

    @Override
    public NotificationResponse createFundRequestNotification(AskForFundRequest request) {
        String startupPart = request.getStartupName() != null
                ? " for " + request.getStartupName() : "";
        String amountPart = request.getFundingAmount() != null
                ? " ($" + String.format("%,.0f", request.getFundingAmount()) + " required)" : "";

        String message = "Investment Funding Request: Dear " + request.getInvestorName() +
                ", you are being requested to fund the execution" + startupPart + amountPart +
                ". Please log in to your account and proceed with the investment. " +
                "This request was sent by the RG Partners team.";

        Notification notification = Notification.builder()
                .recipientUserId(request.getInvestorUserId())
                .type(NotificationType.FUND_REQUEST)
                .message(message)
                .relatedExecutionId(request.getExecutionId())
                .read(false)
                .build();

        return toResponse(notificationRepository.save(notification));
    }

    @Override
    public NotificationResponse createWithholdNotification(WithholdNoticeRequest request) {
        String fieldPart = StringUtils.hasText(request.getExecutionTitle())
                ? " in " + request.getExecutionTitle() : "";

        String message = "Investor " + request.getInvestorName() + " has withheld execution #" +
                request.getExecutionId() + fieldPart +
                " — they will no longer be funding this investment. Reason: " + request.getReason();

        Notification notification = Notification.builder()
                .recipientUserId(request.getStartupUserId())
                .type(NotificationType.EXECUTION_WITHHELD)
                .message(message)
                .relatedExecutionId(request.getExecutionId())
                .read(false)
                .build();

        return toResponse(notificationRepository.save(notification));
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