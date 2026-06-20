package com.example.Evaluation.and.Decision.Service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReviewFromScoreRequest {

    @NotNull(message = "Execution ID is required")
    private Long executionId;

    @NotNull(message = "Startup user ID is required")
    private Long startupUserId;

    @NotNull(message = "Financial health is required")
    private Double financialHealth;

    @NotNull(message = "Team strength is required")
    private Double teamStrength;

    @NotNull(message = "Market potential is required")
    private Double marketPotential;

    @NotNull(message = "Business viability is required")
    private Double businessViability;

    @NotNull(message = "Overall score is required")
    private Double overallScore;

    @NotNull(message = "Classification is required")
    private String classification;

    private String aiReasoning;
    private String companySize;
    private String problemStatement;
    private String businessModel;
    private String targetMarket;
    private Double fundingNeeded;
}
