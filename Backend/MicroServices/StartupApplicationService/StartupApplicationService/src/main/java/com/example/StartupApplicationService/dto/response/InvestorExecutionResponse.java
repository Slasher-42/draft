package com.example.StartupApplicationService.dto.response;

import com.example.StartupApplicationService.enums.ExecutionStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("industry")
    private String preferredIndustry;

    @JsonProperty("reasonForInvesting")
    private String investmentReason;

    private Double investmentBudget;

    @JsonProperty("dreamOfSuccess")
    private String expectedReturnTimeline;

    @JsonProperty("specificCriteria")
    private String successCriteria;

    @JsonProperty("sessionId")
    private String aiSessionId;

    private String additionalConsiderations;
    private ExecutionStatus status;

    @JsonProperty("reason")
    private String statusReason;

    private LocalDateTime statusUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}