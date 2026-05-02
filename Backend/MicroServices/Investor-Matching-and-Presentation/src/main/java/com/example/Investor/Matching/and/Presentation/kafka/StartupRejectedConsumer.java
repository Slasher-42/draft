package com.example.Investor.Matching.and.Presentation.kafka;

import com.example.Investor.Matching.and.Presentation.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupRejectedConsumer {

    private final MatchingService matchingService;

    @KafkaListener(topics = "startup.rejected", groupId = "matching-service")
    public void onStartupRejected(String message) {
        try {
            log.info("[Kafka] Received startup.rejected: {}", message);

            String[] parts = message.split(":", 3);
            if (parts.length < 2) {
                log.error("[Kafka] Malformed startup.rejected message: {}", message);
                return;
            }

            Long executionId = Long.parseLong(parts[0]);
            matchingService.markStartupRejected(executionId);

            log.info("[Kafka] Startup execution {} marked as REJECTED", executionId);
        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.rejected message: {}", e.getMessage());
        }
    }
}
