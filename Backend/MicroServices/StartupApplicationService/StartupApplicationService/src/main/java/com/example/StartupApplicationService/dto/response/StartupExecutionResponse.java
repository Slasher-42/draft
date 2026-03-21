package com.example.StartupApplicationService.dto.response;

import com.example.StartupApplicationService.enums.CompanySize;
import com.example.StartupApplicationService.enums.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartupExecutionResponse {

    private Long id;
    private Long userId;
    private CompanySize targetCompanySize;
    private String suggestedFundingRange;
    private String problemStatement;
    private String businessModel;
    private String targetMarket;
    private String teamDetails;
    private Double annualRevenue;
    private Double monthlyBurnRate;
    private Double fundingNeeded;
    private String aiSessionId;
    private String additionalConsiderations;
    private ExecutionStatus status;
    private String statusReason;
    private LocalDateTime statusUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}