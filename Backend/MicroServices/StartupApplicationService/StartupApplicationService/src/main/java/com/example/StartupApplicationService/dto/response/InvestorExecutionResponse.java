package com.example.StartupApplicationService.dto.response;

import com.example.StartupApplicationService.enums.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvestorExecutionResponse {

    private Long id;
    private Long userId;
    private String preferredIndustry;
    private String investmentReason;
    private Double investmentBudget;
    private String expectedReturnTimeline;
    private String successCriteria;
    private String aiSessionId;
    private String additionalConsiderations;
    private ExecutionStatus status;
    private String statusReason;
    private LocalDateTime statusUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}