package com.example.Evaluation.and.Decision.Service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private long totalAssigned;
    private long pending;
    private long approved;
    private long rejected;
    private long escalated;
}