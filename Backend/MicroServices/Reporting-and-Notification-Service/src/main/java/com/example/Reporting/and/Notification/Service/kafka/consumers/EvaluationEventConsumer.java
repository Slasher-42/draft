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
public class EvaluationEventConsumer {

    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "startup.approved", groupId = "reporting-service")
    public void onStartupApproved(String message) {
        try {
            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed startup.approved message: {}", message);
                return;
            }

            Long executionId   = Long.parseLong(parts[0]);
            Long startupUserId = Long.parseLong(parts[1]);

            Notification notification = Notification.builder()
                    .recipientUserId(startupUserId)
                    .type(NotificationType.STARTUP_APPROVED)
                    .message("Great news! Your execution has been reviewed and approved. " +
                            "You are now eligible for investor matching.")
                    .relatedExecutionId(executionId)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] STARTUP_APPROVED notification saved for userId={}", startupUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.approved: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.rejected", groupId = "reporting-service")
    public void onStartupRejected(String message) {
        try {
            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed startup.rejected message: {}", message);
                return;
            }

            Long executionId   = Long.parseLong(parts[0]);
            Long startupUserId = Long.parseLong(parts[1]);
            String reason      = parts[2];

            Notification notification = Notification.builder()
                    .recipientUserId(startupUserId)
                    .type(NotificationType.STARTUP_REJECTED)
                    .message("Your execution has been reviewed. Decision: Rejected. Reason: " + reason)
                    .relatedExecutionId(executionId)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] STARTUP_REJECTED notification saved for userId={}", startupUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.rejected: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.escalated", groupId = "reporting-service")
    public void onStartupEscalated(String message) {
        try {
            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed startup.escalated message: {}", message);
                return;
            }

            Long executionId   = Long.parseLong(parts[0]);
            Long startupUserId = Long.parseLong(parts[1]);

            Notification notification = Notification.builder()
                    .recipientUserId(startupUserId)
                    .type(NotificationType.STARTUP_ESCALATED)
                    .message("Your execution has been escalated for senior review. " +
                            "You will be notified once a final decision is made.")
                    .relatedExecutionId(executionId)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("[Kafka] STARTUP_ESCALATED notification saved for userId={}", startupUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.escalated: {}", e.getMessage());
        }
    }
}