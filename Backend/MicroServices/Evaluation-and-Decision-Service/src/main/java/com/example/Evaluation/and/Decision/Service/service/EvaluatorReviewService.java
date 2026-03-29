package com.example.Evaluation.and.Decision.Service.service;

import com.example.Evaluation.and.Decision.Service.dto.request.AssignEvaluatorRequest;
import com.example.Evaluation.and.Decision.Service.dto.request.DecisionRequest;
import com.example.Evaluation.and.Decision.Service.dto.response.EvaluatorReviewResponse;

import java.util.List;

public interface EvaluatorReviewService {

    EvaluatorReviewResponse getById(Long id);

    List<EvaluatorReviewResponse> getMyReviews(Long evaluatorId);

    List<EvaluatorReviewResponse> getAllReviews();

    EvaluatorReviewResponse submitDecision(Long id, Long evaluatorId, DecisionRequest request);

    EvaluatorReviewResponse assignEvaluator(Long id, AssignEvaluatorRequest request);

    EvaluatorReviewResponse createReviewFromScore(
            Long executionId,
            Long startupUserId,
            Double financialHealth,
            Double teamStrength,
            Double marketPotential,
            Double businessViability,
            Double overallScore,
            String classification,
            String aiReasoning,
            String companySize,
            String problemStatement,
            String businessModel,
            String targetMarket,
            Double fundingNeeded
    );

    long countPendingForEvaluator(Long evaluatorId);
}