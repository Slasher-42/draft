package com.example.Reporting.and.Notification.Service.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String TOPIC_STARTUP_APPROVED            = "startup.approved";
    public static final String TOPIC_STARTUP_REJECTED            = "startup.rejected";
    public static final String TOPIC_STARTUP_ESCALATED           = "startup.escalated";
    public static final String TOPIC_MATCH_PRESENTED_TO_STARTUP  = "match.presented.to.startup";
    public static final String TOPIC_MATCH_PRESENTED_TO_INVESTOR = "match.presented.to.investor";
    public static final String TOPIC_SCORE_GENERATED             = "score.generated.full";
    public static final String TOPIC_MEETUP_SCHEDULED            = "meetup-scheduled";
    public static final String TOPIC_MEETUP_REMINDER             = "meetup-reminder";
    public static final String TOPIC_MEETUP_COMPLETED            = "meetup-completed";

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

    @Bean
    public NewTopic matchPresentedToStartupTopic() {
        return TopicBuilder.name(TOPIC_MATCH_PRESENTED_TO_STARTUP).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic matchPresentedToInvestorTopic() {
        return TopicBuilder.name(TOPIC_MATCH_PRESENTED_TO_INVESTOR).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic scoreGeneratedTopic() {
        return TopicBuilder.name(TOPIC_SCORE_GENERATED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic meetupScheduledTopic() {
        return TopicBuilder.name(TOPIC_MEETUP_SCHEDULED).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic meetupReminderTopic() {
        return TopicBuilder.name(TOPIC_MEETUP_REMINDER).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic meetupCompletedTopic() {
        return TopicBuilder.name(TOPIC_MEETUP_COMPLETED).partitions(1).replicas(1).build();
    }
}