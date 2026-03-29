package com.example.Reporting.and.Notification.Service.kafka.consumers;

import com.example.Reporting.and.Notification.Service.model.AnalyticsSummary;
import com.example.Reporting.and.Notification.Service.repository.AnalyticsSummaryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScoreEventConsumer {

    private final AnalyticsSummaryRepository analyticsRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "score.generated.full", groupId = "reporting-service")
    public void onScoreGenerated(String message) {
        try {
            String[] parts = message.split(":", 14);
            if (parts.length < 14) {
                log.error("[Kafka] Malformed score.generated.full message: {}", message);
                return;
            }

            String industry    = parts[9];
            Double overallScore = Double.parseDouble(parts[6]);
            String today       = LocalDate.now().toString();

            AnalyticsSummary summary = analyticsRepository.findTopByOrderByIdAsc()
                    .orElse(AnalyticsSummary.builder()
                            .totalExecutions(0)
                            .totalApproved(0)
                            .totalRejected(0)
                            .totalMatched(0)
                            .totalEscalated(0)
                            .scoreDataJson("{\"scoreByIndustry\":[],\"executionTrend\":[]}")
                            .build());

            summary.setTotalExecutions(summary.getTotalExecutions() + 1);

            Map<String, Object> scoreData = objectMapper.readValue(
                    summary.getScoreDataJson(), Map.class);

            List<Map<String, Object>> industryList =
                    (List<Map<String, Object>>) scoreData.get("scoreByIndustry");
            if (industryList == null) industryList = new ArrayList<>();

            boolean found = false;
            for (Map<String, Object> entry : industryList) {
                if (industry.equalsIgnoreCase((String) entry.get("industry"))) {
                    double total = ((Number) entry.get("totalScore")).doubleValue() + overallScore;
                    long count   = ((Number) entry.get("count")).longValue() + 1;
                    entry.put("totalScore", total);
                    entry.put("count", count);
                    found = true;
                    break;
                }
            }
            if (!found) {
                industryList.add(Map.of("industry", industry, "totalScore", overallScore, "count", 1));
            }

            List<Map<String, Object>> trendList =
                    (List<Map<String, Object>>) scoreData.get("executionTrend");
            if (trendList == null) trendList = new ArrayList<>();

            boolean todayFound = false;
            for (Map<String, Object> entry : trendList) {
                if (today.equals(entry.get("date"))) {
                    long count = ((Number) entry.get("count")).longValue() + 1;
                    entry.put("count", count);
                    todayFound = true;
                    break;
                }
            }
            if (!todayFound) {
                trendList.add(Map.of("date", today, "count", 1));
            }

            scoreData.put("scoreByIndustry", industryList);
            scoreData.put("executionTrend", trendList);
            summary.setScoreDataJson(objectMapper.writeValueAsString(scoreData));

            analyticsRepository.save(summary);
            log.info("[Kafka] Analytics updated — industry={} score={}", industry, overallScore);

        } catch (Exception e) {
            log.error("[Kafka] Failed to process score.generated.full: {}", e.getMessage());
        }
    }
}