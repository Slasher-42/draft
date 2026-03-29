package com.example.Investor.Matching.and.Presentation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestorExecutionDTO {
    private Long id;
    private Long userId;
    private String preferredIndustry;
    private String investmentReason;
    private Double investmentBudget;
    private String expectedReturnTimeline;
    private String successCriteria;
    private String additionalConsiderations;
    private String status;
}