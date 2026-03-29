package com.example.Evaluation.and.Decision.Service.dto.response;

import com.example.Evaluation.and.Decision.Service.enums.DecisionStatus;
import com.example.Evaluation.and.Decision.Service.enums.ReviewDecision;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluatorReviewResponse {

    private Long id;
    private Long executionId;
    private Long startupUserId;
    private Long evaluatorId;

    private Double financialHealth;
    private Double teamStrength;
    private Double marketPotential;
    private Double businessViability;
    private Double overallScore;
    private String classification;
    private String aiReasoning;

    private String companySize;
    private String problemStatement;
    private String businessModel;
    private String targetMarket;
    private Double fundingNeeded;

    private ReviewDecision decision;
    private String reason;
    private DecisionStatus status;

    private LocalDateTime decidedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}