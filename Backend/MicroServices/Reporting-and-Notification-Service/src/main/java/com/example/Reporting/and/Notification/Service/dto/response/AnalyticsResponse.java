package com.example.Reporting.and.Notification.Service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnalyticsResponse {

    private long totalExecutions;
    private long totalApproved;
    private long totalRejected;
    private long totalMatched;
    private long totalEscalated;

    private List<IndustryScore> scoreByIndustry;
    private List<TrendEntry> executionTrend;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class IndustryScore {
        private String industry;
        private double totalScore;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendEntry {
        private String date;
        private long count;
    }
}