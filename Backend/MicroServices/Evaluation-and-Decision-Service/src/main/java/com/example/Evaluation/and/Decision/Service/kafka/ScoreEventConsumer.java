package com.example.Evaluation.and.Decision.Service.kafka;

import com.example.Evaluation.and.Decision.Service.service.EvaluatorReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScoreEventConsumer {

    private final EvaluatorReviewService reviewService;

    @KafkaListener(topics = "score.generated.full", groupId = "evaluation-service")
    public void onScoreGenerated(String message) {
        try {
            log.info("[Kafka] Received score.generated.full: {}", message);

            String[] parts = message.split(":", 14);
            if (parts.length < 14) {
                log.error("[Kafka] Malformed score.generated.full message: {}", message);
                return;
            }

            Long executionId       = Long.parseLong(parts[0]);
            Long startupUserId     = Long.parseLong(parts[1]);
            Double financialHealth = Double.parseDouble(parts[2]);
            Double teamStrength    = Double.parseDouble(parts[3]);
            Double marketPotential = Double.parseDouble(parts[4]);
            Double businessViability = Double.parseDouble(parts[5]);
            Double overallScore    = Double.parseDouble(parts[6]);
            String classification  = parts[7];
            String aiReasoning     = parts[8];
            String companySize     = parts[9];
            String problemStatement = parts[10];
            String businessModel   = parts[11];
            String targetMarket    = parts[12];
            Double fundingNeeded   = Double.parseDouble(parts[13]);

            reviewService.createReviewFromScore(
                    executionId,
                    startupUserId,
                    financialHealth,
                    teamStrength,
                    marketPotential,
                    businessViability,
                    overallScore,
                    classification,
                    aiReasoning,
                    companySize,
                    problemStatement,
                    businessModel,
                    targetMarket,
                    fundingNeeded
            );

            log.info("[Kafka] Review created for executionId={}", executionId);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process score.generated.full message: {}", e.getMessage());
        }
    }
}