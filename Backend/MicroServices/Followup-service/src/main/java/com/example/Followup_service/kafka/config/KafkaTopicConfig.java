package com.example.Followup_service.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic meetupScheduledTopic() {
        return TopicBuilder.name("meetup-scheduled").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic meetupCompletedTopic() {
        return TopicBuilder.name("meetup-completed").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic meetupReminderTopic() {
        return TopicBuilder.name("meetup-reminder").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic contractValidatedTopic() {
        return TopicBuilder.name("contract-validated").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic investmentTransferredTopic() {
        return TopicBuilder.name("investment-transferred").partitions(1).replicas(1).build();
    }
}
