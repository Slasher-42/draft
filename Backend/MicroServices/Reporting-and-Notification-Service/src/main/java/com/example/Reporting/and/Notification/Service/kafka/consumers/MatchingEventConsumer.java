package com.example.Reporting.and.Notification.Service.kafka.consumers;

import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import com.example.Reporting.and.Notification.Service.model.Notification;
import com.example.Reporting.and.Notification.Service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingEventConsumer {

    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "match.presented.to.startup", groupId = "reporting-service")
    public void onMatchPresentedToStartup(String message) {
        try {
            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed match.presented.to.startup message: {}", message);
                return;
            }

            Long matchId           = Long.parseLong(parts[0]);
            Long startupUserId     = Long.parseLong(parts[1]);
            Long investorExecutionId = Long.parseLong(parts[2]);

            Notification notification = Notification.builder()
                    .recipientUserId(startupUserId)
                    .type(NotificationType.MATCH_FOUND)
                    .message("A match has been found! An investor aligned with your criteria " +
                            "has been identified. Visit your executions page to view the details.")
                    .relatedExecutionId(investorExecutionId)
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
            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed match.presented.to.investor message: {}", message);
                return;
            }

            Long matchId              = Long.parseLong(parts[0]);
            Long investorUserId       = Long.parseLong(parts[1]);
            Long startupExecutionId   = Long.parseLong(parts[2]);

            Notification notification = Notification.builder()
                    .recipientUserId(investorUserId)
                    .type(NotificationType.MATCH_FOUND)
                    .message("A startup matching your investment criteria has been found. " +
                            "Visit your collaborators page to view the details.")
                    .relatedExecutionId(startupExecutionId)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] MATCH_FOUND notification saved for investorUserId={}", investorUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process match.presented.to.investor: {}", e.getMessage());
        }
    }
}