package com.example.Evaluation.and.Decision.Service.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String TOPIC_EVALUATION_COMPLETED  = "evaluation.completed";
    public static final String TOPIC_STARTUP_APPROVED      = "startup.approved";
    public static final String TOPIC_STARTUP_REJECTED      = "startup.rejected";
    public static final String TOPIC_STARTUP_ESCALATED     = "startup.escalated";

    @Bean
    public NewTopic evaluationCompletedTopic() {
        return TopicBuilder.name(TOPIC_EVALUATION_COMPLETED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic startupApprovedTopic() {
        return TopicBuilder.name(TOPIC_STARTUP_APPROVED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic startupRejectedTopic() {
        return TopicBuilder.name(TOPIC_STARTUP_REJECTED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic startupEscalatedTopic() {
        return TopicBuilder.name(TOPIC_STARTUP_ESCALATED).partitions(3).replicas(1).build();
    }
}