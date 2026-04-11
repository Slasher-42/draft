package com.example.Followup_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowupEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void publishMeetupScheduled(Long meetupId, Long investorUserId, Long startupUserId,
                                       Long matchId, String roomId) {
        send("meetup-scheduled",
                String.valueOf(meetupId),
                meetupId + ":" + investorUserId + ":" + startupUserId + ":" + matchId + ":" + roomId);
    }

    public void publishMeetupCompleted(Long meetupId, Long matchId) {
        send("meetup-completed",
                String.valueOf(meetupId),
                meetupId + ":" + matchId);
    }

    public void publishContractValidated(Long contractId, Long meetupId,
                                         Long investorUserId, Long startupUserId) {
        send("contract-validated",
                String.valueOf(contractId),
                contractId + ":" + meetupId + ":" + investorUserId + ":" + startupUserId);
    }

    public void publishInvestmentTransferred(Long transactionId, Long fromUserId,
                                             Long toUserId, Long matchId) {
        send("investment-transferred",
                String.valueOf(transactionId),
                transactionId + ":" + fromUserId + ":" + toUserId + ":" + matchId);
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
