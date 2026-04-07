package com.example.Investor.Matching.and.Presentation.kafka;

import com.example.Investor.Matching.and.Presentation.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvestorExecutionSubmittedConsumer {

    private final MatchingService matchingService;

    @KafkaListener(topics = "execution.investor.submitted", groupId = "matching-service")
    public void onInvestorExecutionSubmitted(String message) {
        try {
            log.info("[Kafka] Received execution.investor.submitted: {}", message);

            String[] parts = message.split(":", 2);
            if (parts.length < 2) {
                log.error("[Kafka] Malformed execution.investor.submitted message: {}", message);
                return;
            }

            Long executionId   = Long.parseLong(parts[0]);
            Long investorUserId = Long.parseLong(parts[1]);

            matchingService.runMatchingForNewInvestor(executionId, investorUserId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process execution.investor.submitted: {}", e.getMessage());
        }
    }
}
