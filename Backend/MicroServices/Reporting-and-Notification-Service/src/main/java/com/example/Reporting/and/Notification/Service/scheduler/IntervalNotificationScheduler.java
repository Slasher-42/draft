package com.example.Reporting.and.Notification.Service.scheduler;

import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import com.example.Reporting.and.Notification.Service.model.Notification;
import com.example.Reporting.and.Notification.Service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class IntervalNotificationScheduler {

    private final NotificationRepository notificationRepository;
    private final WebClient webClient;

    @Value("${services.user-management.url}")
    private String userManagementUrl;

    @Value("${services.startup-application.url}")
    private String startupApplicationUrl;

    @Scheduled(fixedDelayString = "${scheduler.interval.ms:60000}")
    public void checkPendingExecutions() {
        try {
            long intervalMillis = fetchIntervalMillis();
            LocalDateTime cutoff = LocalDateTime.now().minusNanos(intervalMillis * 1_000_000L);

            checkPendingStartupExecutions(intervalMillis, cutoff);
            checkPendingInvestorExecutions(intervalMillis, cutoff);

        } catch (Exception e) {
            log.error("[Scheduler] Failed during pending execution check: {}", e.getMessage());
        }
    }

    private void checkPendingStartupExecutions(long intervalMillis, LocalDateTime cutoff) {
        try {
            List<Map<String, Object>> executions = fetchPendingStartupExecutions();
            if (executions == null || executions.isEmpty()) return;

            String intervalLabel = formatInterval(intervalMillis);

            for (Map<String, Object> exec : executions) {
                Long executionId   = toLong(exec.get("id"));
                Long userId        = toLong(exec.get("userId"));
                String createdAtStr = (String) exec.get("createdAt");

                if (executionId == null || userId == null || createdAtStr == null) continue;

                LocalDateTime createdAt = LocalDateTime.parse(createdAtStr.substring(0, 19));

                if (createdAt.isAfter(cutoff)) continue;

                boolean alreadyNotified = notificationRepository
                        .existsByRecipientUserIdAndRelatedExecutionIdAndTypeAndCreatedAtAfter(
                                userId, executionId, NotificationType.INTERVAL_UPDATE, cutoff);

                if (alreadyNotified) continue;

                Notification notification = Notification.builder()
                        .recipientUserId(userId)
                        .type(NotificationType.INTERVAL_UPDATE)
                        .message("No investor match has been found yet for your execution. " +
                                "You will receive the next update in " + intervalLabel + ".")
                        .relatedExecutionId(executionId)
                        .read(false)
                        .build();

                notificationRepository.save(notification);
                log.info("[Scheduler] INTERVAL_UPDATE sent to startupUserId={} executionId={}",
                        userId, executionId);
            }

        } catch (Exception e) {
            log.error("[Scheduler] Failed checking startup executions: {}", e.getMessage());
        }
    }

    private void checkPendingInvestorExecutions(long intervalMillis, LocalDateTime cutoff) {
        try {
            List<Map<String, Object>> executions = fetchPendingInvestorExecutions();
            if (executions == null || executions.isEmpty()) return;

            String intervalLabel = formatInterval(intervalMillis);

            for (Map<String, Object> exec : executions) {
                Long executionId    = toLong(exec.get("id"));
                Long userId         = toLong(exec.get("userId"));
                String createdAtStr = (String) exec.get("createdAt");

                if (executionId == null || userId == null || createdAtStr == null) continue;

                LocalDateTime createdAt = LocalDateTime.parse(createdAtStr.substring(0, 19));

                if (createdAt.isAfter(cutoff)) continue;

                boolean alreadyNotified = notificationRepository
                        .existsByRecipientUserIdAndRelatedExecutionIdAndTypeAndCreatedAtAfter(
                                userId, executionId, NotificationType.INTERVAL_UPDATE, cutoff);

                if (alreadyNotified) continue;

                Notification notification = Notification.builder()
                        .recipientUserId(userId)
                        .type(NotificationType.INTERVAL_UPDATE)
                        .message("No startup match has been found yet for your investment execution. " +
                                "You will receive the next update in " + intervalLabel + ".")
                        .relatedExecutionId(executionId)
                        .read(false)
                        .build();

                notificationRepository.save(notification);
                log.info("[Scheduler] INTERVAL_UPDATE sent to investorUserId={} executionId={}",
                        userId, executionId);
            }

        } catch (Exception e) {
            log.error("[Scheduler] Failed checking investor executions: {}", e.getMessage());
        }
    }

    private long fetchIntervalMillis() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(userManagementUrl + "/api/config")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return 3_600_000L;

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            long value  = ((Number) data.get("updateIntervalValue")).longValue();
            String unit = ((String) data.get("updateIntervalUnit")).toUpperCase();

            return switch (unit) {
                case "MINUTES" -> value * 60_000L;
                case "HOURS"   -> value * 3_600_000L;
                case "DAYS"    -> value * 86_400_000L;
                default        -> 3_600_000L;
            };

        } catch (Exception e) {
            log.warn("[Scheduler] Could not fetch interval config, defaulting to 1 hour: {}", e.getMessage());
            return 3_600_000L;
        }
    }

    private String formatInterval(long millis) {
        if (millis >= 86_400_000L) return (millis / 86_400_000L) + " days";
        if (millis >= 3_600_000L)  return (millis / 3_600_000L)  + " hours";
        return (millis / 60_000L) + " minutes";
    }

    private List<Map<String, Object>> fetchPendingStartupExecutions() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupApplicationUrl + "/api/executions/startup/internal/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return List.of();

            List<Map<String, Object>> all = (List<Map<String, Object>>) response.get("data");
            return all.stream()
                    .filter(e -> "PENDING".equalsIgnoreCase((String) e.get("status")))
                    .toList();

        } catch (Exception e) {
            log.error("[Scheduler] Failed to fetch startup executions: {}", e.getMessage());
            return List.of();
        }
    }

    private List<Map<String, Object>> fetchPendingInvestorExecutions() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(startupApplicationUrl + "/api/executions/investor/internal/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response == null || response.get("data") == null) return List.of();

            List<Map<String, Object>> all = (List<Map<String, Object>>) response.get("data");
            return all.stream()
                    .filter(e -> "PENDING".equalsIgnoreCase((String) e.get("status")))
                    .toList();

        } catch (Exception e) {
            log.error("[Scheduler] Failed to fetch investor executions: {}", e.getMessage());
            return List.of();
        }
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        try { return Long.parseLong(value.toString()); } catch (Exception e) { return null; }
    }
}