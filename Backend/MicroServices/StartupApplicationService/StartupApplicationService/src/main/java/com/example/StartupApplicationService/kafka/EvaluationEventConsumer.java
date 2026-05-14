package com.example.StartupApplicationService.kafka;

import com.example.StartupApplicationService.service.StartupExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EvaluationEventConsumer {

    private final StartupExecutionService startupExecutionService;

    @KafkaListener(topics = "startup.approved", groupId = "startup-application-service")
    public void onStartupApproved(String message) {
        try {
            log.info("[Kafka] Received startup.approved: {}", message);
            String[] parts = message.split(":", 3);
            if (parts.length < 2) {
                log.error("[Kafka] Malformed startup.approved message: {}", message);
                return;
            }
            Long executionId = Long.parseLong(parts[0]);
            startupExecutionService.updateStatusInternal(executionId, "APPROVED");
            log.info("[Kafka] Startup execution {} status updated to APPROVED", executionId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.approved: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.rejected", groupId = "startup-application-service")
    public void onStartupRejected(String message) {
        try {
            log.info("[Kafka] Received startup.rejected: {}", message);
            String[] parts = message.split(":", 3);
            if (parts.length < 2) {
                log.error("[Kafka] Malformed startup.rejected message: {}", message);
                return;
            }
            Long executionId = Long.parseLong(parts[0]);
            startupExecutionService.updateStatusInternal(executionId, "REJECTED");
            log.info("[Kafka] Startup execution {} status updated to REJECTED", executionId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.rejected: {}", e.getMessage());
        }
    }
}