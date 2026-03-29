package com.example.Investor.Matching.and.Presentation.kafka;

import com.example.Investor.Matching.and.Presentation.kafka.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchingEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishMatchFound(Long matchId, Long startupExecutionId, Long investorExecutionId) {
        send(KafkaTopicConfig.TOPIC_MATCH_FOUND,
                String.valueOf(matchId),
                matchId + ":" + startupExecutionId + ":" + investorExecutionId);
    }

    public void publishMatchPresentedToInvestor(Long matchId, Long investorUserId, Long startupExecutionId) {
        send(KafkaTopicConfig.TOPIC_MATCH_PRESENTED_TO_INVESTOR,
                String.valueOf(matchId),
                matchId + ":" + investorUserId + ":" + startupExecutionId);
    }

    public void publishMatchPresentedToStartup(Long matchId, Long startupUserId, Long investorExecutionId) {
        send(KafkaTopicConfig.TOPIC_MATCH_PRESENTED_TO_STARTUP,
                String.valueOf(matchId),
                matchId + ":" + startupUserId + ":" + investorExecutionId);
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