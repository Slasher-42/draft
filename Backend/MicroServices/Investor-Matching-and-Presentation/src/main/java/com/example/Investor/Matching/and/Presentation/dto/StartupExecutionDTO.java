package com.example.Investor.Matching.and.Presentation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartupExecutionDTO {
    private Long id;
    private Long userId;
    private String targetCompanySize;
    private String problemStatement;
    private String businessModel;
    private String targetMarket;
    private String teamDetails;
    private Double annualRevenue;
    private Double monthlyBurnRate;
    private Double fundingNeeded;
    private String industry;
    private String status;
}