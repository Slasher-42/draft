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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeetupEventConsumer {

    private final NotificationRepository notificationRepository;
    private final WebClient webClient;

    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");

    @Value("${services.user-management.url}")
    private String userManagementUrl;

    @KafkaListener(topics = "meetup-scheduled", groupId = "reporting-service")
    public void onMeetupScheduled(String message) {
        try {
            // Format: meetupId:investorUserId:startupUserId:matchId:roomId:scheduledAt
            String[] parts = message.split(":", 6);
            if (parts.length < 6) {
                log.error("[Kafka] Malformed meetup-scheduled message: {}", message);
                return;
            }

            Long meetupId = parseLongSafe(parts[0]);
            Long investorUserId = parseLongSafe(parts[1]);
            Long startupUserId = parseLongSafe(parts[2]);
            String scheduledAtDisplay = formatScheduledAt(parts[5]);

            String investorName = fetchUserName(investorUserId);
            String startupName = fetchUserName(startupUserId);

            saveNotification(investorUserId, NotificationType.MEETUP_SCHEDULED,
                    "Your meetup with " + (startupName != null ? startupName : "the startup") +
                            " has been scheduled for " + scheduledAtDisplay + ".",
                    meetupId);

            saveNotification(startupUserId, NotificationType.MEETUP_SCHEDULED,
                    "Your meetup with " + (investorName != null ? investorName : "the investor") +
                            " has been scheduled for " + scheduledAtDisplay + ".",
                    meetupId);

            log.info("[Kafka] MEETUP_SCHEDULED notifications saved for meetupId={}", meetupId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process meetup-scheduled: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "meetup-reminder", groupId = "reporting-service")
    public void onMeetupReminder(String message) {
        try {
            // Format: meetupId:investorUserId:startupUserId:matchId:roomId:scheduledAt
            String[] parts = message.split(":", 6);
            if (parts.length < 6) {
                log.error("[Kafka] Malformed meetup-reminder message: {}", message);
                return;
            }

            Long meetupId = parseLongSafe(parts[0]);
            Long investorUserId = parseLongSafe(parts[1]);
            Long startupUserId = parseLongSafe(parts[2]);
            String scheduledAtDisplay = formatScheduledAt(parts[5]);

            String reminderMessage = "Reminder: your meetup starts in 1 minute (" + scheduledAtDisplay + ").";

            saveNotification(investorUserId, NotificationType.MEETUP_REMINDER, reminderMessage, meetupId);
            saveNotification(startupUserId, NotificationType.MEETUP_REMINDER, reminderMessage, meetupId);

            log.info("[Kafka] MEETUP_REMINDER notifications saved for meetupId={}", meetupId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process meetup-reminder: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "meetup-completed", groupId = "reporting-service")
    public void onMeetupCompleted(String message) {
        try {
            // Format: meetupId:matchId:investorUserId:startupUserId
            String[] parts = message.split(":", 4);
            if (parts.length < 4) {
                log.error("[Kafka] Malformed meetup-completed message: {}", message);
                return;
            }

            Long meetupId = parseLongSafe(parts[0]);
            Long investorUserId = parseLongSafe(parts[2]);
            Long startupUserId = parseLongSafe(parts[3]);

            String completedMessage = "Your meetup has been marked as completed.";

            saveNotification(investorUserId, NotificationType.MEETUP_COMPLETED, completedMessage, meetupId);
            saveNotification(startupUserId, NotificationType.MEETUP_COMPLETED, completedMessage, meetupId);

            log.info("[Kafka] MEETUP_COMPLETED notifications saved for meetupId={}", meetupId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process meetup-completed: {}", e.getMessage());
        }
    }

    private void saveNotification(Long recipientUserId, NotificationType type, String message, Long meetupId) {
        if (recipientUserId == null) return;
        Notification notification = Notification.builder()
                .recipientUserId(recipientUserId)
                .type(type)
                .message(message)
                .relatedExecutionId(meetupId)
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private String formatScheduledAt(String raw) {
        try {
            return LocalDateTime.parse(raw).format(DISPLAY_FORMAT);
        } catch (Exception e) {
            return raw;
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

    private Long parseLongSafe(String s) {
        try { return Long.parseLong(s.trim()); } catch (Exception e) { return null; }
    }
}
