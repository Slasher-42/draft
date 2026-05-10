package com.example.StartupApplicationService.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExecutionEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishStartupExecutionSubmitted(Long executionId, Long userId) {
        send("execution.startup.submitted", String.valueOf(executionId), executionId + ":" + userId);
    }

    public void publishInvestorExecutionSubmitted(Long executionId, Long userId) {
        send("execution.investor.submitted", String.valueOf(executionId), executionId + ":" + userId);
    }

    public void publishExecutionStatusUpdated(Long executionId, String status) {
        send("execution.status.updated", String.valueOf(executionId), executionId + ":" + status);
    }

    private void send(String topic, String key, String message) {
        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, key, message);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.warn("[Kafka] Failed to publish to topic '{}': {}", topic, ex.getMessage());
            } else {
                log.info("[Kafka] Published to topic '{}' | partition={} | offset={}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}