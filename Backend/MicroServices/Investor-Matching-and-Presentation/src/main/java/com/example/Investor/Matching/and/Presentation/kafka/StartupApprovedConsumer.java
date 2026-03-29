package com.example.Investor.Matching.and.Presentation.kafka;

import com.example.Investor.Matching.and.Presentation.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupApprovedConsumer {

    private final MatchingService matchingService;

    @KafkaListener(topics = "startup.approved", groupId = "matching-service")
    public void onStartupApproved(String message) {
        try {
            log.info("[Kafka] Received startup.approved: {}", message);

            String[] parts = message.split(":", 3);
            if (parts.length < 3) {
                log.error("[Kafka] Malformed startup.approved message: {}", message);
                return;
            }

            Long executionId   = Long.parseLong(parts[0]);
            Long startupUserId = Long.parseLong(parts[1]);

            matchingService.runMatching(executionId, startupUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process startup.approved message: {}", e.getMessage());
        }
    }
}