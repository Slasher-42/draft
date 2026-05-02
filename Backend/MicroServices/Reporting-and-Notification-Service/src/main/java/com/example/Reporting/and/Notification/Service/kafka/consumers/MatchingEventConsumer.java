package com.example.Reporting.and.Notification.Service.kafka.consumers;

import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import com.example.Reporting.and.Notification.Service.model.Notification;
import com.example.Reporting.and.Notification.Service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingEventConsumer {

    private final NotificationRepository notificationRepository;
    private final WebClient webClient;

    @Value("${services.user-management.url}")
    private String userManagementUrl;

    @KafkaListener(topics = "match.presented.to.startup", groupId = "reporting-service")
    public void onMatchPresentedToStartup(String message) {
        try {
            // Format: matchId:startupUserId:investorExecutionId:investorUserId:industry
            String[] parts = message.split(":", 5);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed match.presented.to.startup message: {}", message);
                return;
            }

            Long startupUserId = Long.parseLong(parts[1]);
            Long investorUserId = parts.length > 3 ? parseLongSafe(parts[3]) : null;
            String industry = parts.length > 4 ? parts[4] : null;

            String investorName = fetchUserName(investorUserId);
            String notificationMessage = buildStartupNotificationMessage(investorName, industry);

            Notification notification = Notification.builder()
                    .recipientUserId(startupUserId)
                    .type(NotificationType.MATCH_FOUND)
                    .message(notificationMessage)
                    .relatedExecutionId(parts.length > 2 ? parseLongSafe(parts[2]) : null)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] MATCH_FOUND notification saved for startupUserId={}", startupUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process match.presented.to.startup: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "match.presented.to.investor", groupId = "reporting-service")
    public void onMatchPresentedToInvestor(String message) {
        try {
            // Format: matchId:investorUserId:startupExecutionId:startupUserId:industry
            String[] parts = message.split(":", 5);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed match.presented.to.investor message: {}", message);
                return;
            }

            Long investorUserId = Long.parseLong(parts[1]);
            Long startupUserId = parts.length > 3 ? parseLongSafe(parts[3]) : null;
            String industry = parts.length > 4 ? parts[4] : null;

            String startupName = fetchUserName(startupUserId);
            String notificationMessage = buildInvestorNotificationMessage(startupName, industry);

            Notification notification = Notification.builder()
                    .recipientUserId(investorUserId)
                    .type(NotificationType.MATCH_FOUND)
                    .message(notificationMessage)
                    .relatedExecutionId(parts.length > 2 ? parseLongSafe(parts[2]) : null)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] MATCH_FOUND notification saved for investorUserId={}", investorUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process match.presented.to.investor: {}", e.getMessage());
        }
    }

    private String fetchUserName(Long userId) {
        if (userId == null) return null;
        try {
            return webClient.get()
                    .uri(userManagementUrl + "/api/users/internal/" + userId + "/name")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.warn("[Kafka] Could not fetch user name for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    private String buildStartupNotificationMessage(String investorName, String industry) {
        StringBuilder msg = new StringBuilder("Great news! You have been matched with ");
        if (investorName != null && !investorName.isBlank()) {
            msg.append("investor ").append(investorName);
        } else {
            msg.append("an investor");
        }
        if (industry != null && !industry.isBlank()) {
            msg.append(" in the ").append(industry).append(" space");
        }
        msg.append(". Visit your executions page to view the full match details.");
        return msg.toString();
    }

    private String buildInvestorNotificationMessage(String startupName, String industry) {
        StringBuilder msg = new StringBuilder("A new match has been found! Startup ");
        if (startupName != null && !startupName.isBlank()) {
            msg.append(startupName);
        } else {
            msg.append("founder");
        }
        if (industry != null && !industry.isBlank()) {
            msg.append(" operating in the ").append(industry).append(" sector");
        }
        msg.append(" aligns with your investment criteria. Visit your dashboard to review the match.");
        return msg.toString();
    }

    private Long parseLongSafe(String s) {
        try { return Long.parseLong(s.trim()); } catch (Exception e) { return null; }
    }
}
