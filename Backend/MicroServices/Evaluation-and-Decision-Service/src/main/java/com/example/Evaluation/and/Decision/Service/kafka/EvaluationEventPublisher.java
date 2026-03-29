package com.example.Evaluation.and.Decision.Service.kafka;

import com.example.Evaluation.and.Decision.Service.kafka.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class EvaluationEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishEvaluationCompleted(Long reviewId, Long executionId, String decision) {
        send(KafkaTopicConfig.TOPIC_EVALUATION_COMPLETED,
                String.valueOf(reviewId),
                reviewId + ":" + executionId + ":" + decision);
    }

    public void publishStartupApproved(Long executionId, Long startupUserId, String reason) {
        send(KafkaTopicConfig.TOPIC_STARTUP_APPROVED,
                String.valueOf(executionId),
                executionId + ":" + startupUserId + ":" + reason);
    }

    public void publishStartupRejected(Long executionId, Long startupUserId, String reason) {
        send(KafkaTopicConfig.TOPIC_STARTUP_REJECTED,
                String.valueOf(executionId),
                executionId + ":" + startupUserId + ":" + reason);
    }

    public void publishStartupEscalated(Long executionId, Long startupUserId, String reason) {
        send(KafkaTopicConfig.TOPIC_STARTUP_ESCALATED,
                String.valueOf(executionId),
                executionId + ":" + startupUserId + ":" + reason);
    }

    private void send(String topic, String key, String message) {
        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, key, message);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[Kafka] Failed to publish to topic '{}': {}", topic, ex.getMessage());
            } else {
                log.info("[Kafka] Published to topic '{}' | partition={} | offset={}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}