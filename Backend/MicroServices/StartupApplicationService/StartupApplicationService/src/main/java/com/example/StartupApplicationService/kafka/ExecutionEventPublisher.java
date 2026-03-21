package com.example.StartupApplicationService.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExecutionEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishStartupExecutionSubmitted(Long executionId, Long userId) {
        String message = executionId + ":" + userId;
        kafkaTemplate.send("execution.startup.submitted", message);
    }

    public void publishInvestorExecutionSubmitted(Long executionId, Long userId) {
        String message = executionId + ":" + userId;
        kafkaTemplate.send("execution.investor.submitted", message);
    }

    public void publishExecutionStatusUpdated(Long executionId, String status) {
        String message = executionId + ":" + status;
        kafkaTemplate.send("execution.status.updated", message);
    }
}