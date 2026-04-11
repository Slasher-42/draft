package com.example.Followup_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchCreatedConsumer {

    @KafkaListener(topics = "match-created", groupId = "followup-service")
    public void consume(String message) {
        try {
            log.info("[Followup] Received match-created: {}", message);

            String[] parts = message.split(":", 4);
            if (parts.length < 3) {
                log.error("[Followup] Malformed match-created message: {}", message);
                return;
            }

            Long matchId        = Long.parseLong(parts[0]);
            Long investorUserId = Long.parseLong(parts[1]);
            Long startupUserId  = Long.parseLong(parts[2]);

            log.info("[Followup] New match received: matchId={}, investor={}, startup={}",
                    matchId, investorUserId, startupUserId);

        } catch (Exception e) {
            log.error("[Followup] Failed to process match-created message: {}", e.getMessage());
        }
    }
}
