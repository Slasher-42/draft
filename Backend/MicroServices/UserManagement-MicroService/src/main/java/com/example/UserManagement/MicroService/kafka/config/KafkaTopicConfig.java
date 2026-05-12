package com.example.UserManagement.MicroService.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {


    public static final String TOPIC_USER_REGISTERED       = "user.registered";
    public static final String TOPIC_USER_DELETED          = "user.deleted";
    public static final String TOPIC_STARTUP_PROFILE_SAVED = "startup.profile.saved";
    public static final String TOPIC_INVESTOR_PROFILE_SAVED = "investor.profile.saved";
    public static final String TOPIC_USER_STATUS_CHANGED = "user.status.changed";

    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name(TOPIC_USER_REGISTERED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userDeletedTopic() {
        return TopicBuilder.name(TOPIC_USER_DELETED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic startupProfileSavedTopic() {
        return TopicBuilder.name(TOPIC_STARTUP_PROFILE_SAVED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic investorProfileSavedTopic() {
        return TopicBuilder.name(TOPIC_INVESTOR_PROFILE_SAVED)
                .partitions(3)
                .replicas(1)
                .build();
    }
    @Bean
    public NewTopic userStatusChangedTopic() {
        return TopicBuilder.name(TOPIC_USER_STATUS_CHANGED).partitions(1).replicas(1).build();
    }
}