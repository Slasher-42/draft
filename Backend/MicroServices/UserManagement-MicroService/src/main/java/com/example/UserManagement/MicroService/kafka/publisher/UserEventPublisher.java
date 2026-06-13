package com.example.UserManagement.MicroService.kafka.publisher;

import com.example.UserManagement.MicroService.kafka.config.KafkaTopicConfig;
import com.example.UserManagement.MicroService.kafka.events.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@Slf4j
public class UserEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public UserEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishUserRegistered(UserRegisteredEvent event) {
        String key = String.valueOf(event.getUserId());
        send(KafkaTopicConfig.TOPIC_USER_REGISTERED, key, event);
    }

    public void publishUserDeleted(UserDeletedEvent event) {
        String key = String.valueOf(event.getUserId());
        send(KafkaTopicConfig.TOPIC_USER_DELETED, key, event);
    }

    public void publishStartupProfileSaved(StartupProfileSavedEvent event) {
        String key = String.valueOf(event.getUserId());
        send(KafkaTopicConfig.TOPIC_STARTUP_PROFILE_SAVED, key, event);
    }

    public void publishInvestorProfileSaved(InvestorProfileSavedEvent event) {
        String key = String.valueOf(event.getUserId());
        send(KafkaTopicConfig.TOPIC_INVESTOR_PROFILE_SAVED, key, event);
    }


    private void send(String topic, String key, Object payload) {
        try {
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, payload);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("[Kafka] Failed to publish to topic '{}' with key '{}': {}",
                            topic, key, ex.getMessage());
                } else {
                    log.info("[Kafka] Published to topic '{}' | partition={} | offset={}",
                            topic,
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                }
            });
        } catch (Exception ex) {
            // send() can throw synchronously (e.g. it couldn't fetch topic metadata
            // within max.block.ms). Never let a Kafka outage fail the calling
            // service method or skip its @CacheEvict.
            log.error("[Kafka] Could not publish to topic '{}' with key '{}': {}",
                    topic, key, ex.getMessage());
        }
    }

    public void publishUserStatusChanged(UserStatusChangedEvent event) {
        String key = String.valueOf(event.getUserId());
        send(KafkaTopicConfig.TOPIC_USER_STATUS_CHANGED, key, event);
    }
}