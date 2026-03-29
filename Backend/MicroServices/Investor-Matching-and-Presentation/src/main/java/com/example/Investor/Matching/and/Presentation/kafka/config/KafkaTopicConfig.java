package com.example.Investor.Matching.and.Presentation.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String TOPIC_MATCH_FOUND                  = "match.found";
    public static final String TOPIC_MATCH_PRESENTED_TO_INVESTOR  = "match.presented.to.investor";
    public static final String TOPIC_MATCH_PRESENTED_TO_STARTUP   = "match.presented.to.startup";

    @Bean
    public NewTopic matchFoundTopic() {
        return TopicBuilder.name(TOPIC_MATCH_FOUND).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic matchPresentedToInvestorTopic() {
        return TopicBuilder.name(TOPIC_MATCH_PRESENTED_TO_INVESTOR).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic matchPresentedToStartupTopic() {
        return TopicBuilder.name(TOPIC_MATCH_PRESENTED_TO_STARTUP).partitions(3).replicas(1).build();
    }
}