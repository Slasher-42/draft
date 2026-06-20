package com.example.Evaluation.and.Decision.Service.controller;

import com.example.Evaluation.and.Decision.Service.dto.request.AssignEvaluatorRequest;
import com.example.Evaluation.and.Decision.Service.dto.request.CreateReviewFromScoreRequest;
import com.example.Evaluation.and.Decision.Service.dto.request.DecisionRequest;
import com.example.Evaluation.and.Decision.Service.dto.response.ApiResponse;
import com.example.Evaluation.and.Decision.Service.dto.response.DashboardStatsResponse;
import com.example.Evaluation.and.Decision.Service.dto.response.EvaluatorReviewResponse;
import com.example.Evaluation.and.Decision.Service.enums.DecisionStatus;
import com.example.Evaluation.and.Decision.Service.enums.ReviewDecision;
import com.example.Evaluation.and.Decision.Service.repository.EvaluatorReviewRepository;
import com.example.Evaluation.and.Decision.Service.service.EvaluatorReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluator")
@RequiredArgsConstructor
public class EvaluatorReviewController {

    private final EvaluatorReviewService reviewService;
    private final EvaluatorReviewRepository reviewRepository;

    @GetMapping("/reviews")
    @PreAuthorize("hasAnyAuthority('ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<EvaluatorReviewResponse>>> getMyReviews(
            Authentication authentication) {
        Long evaluatorId = (Long) authentication.getPrincipal();
        List<EvaluatorReviewResponse> reviews = reviewService.getMyReviews(evaluatorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reviews fetched successfully", reviews));
    }

    @GetMapping("/reviews/all")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EVALUATOR')")
public ResponseEntity<ApiResponse<List<EvaluatorReviewResponse>>> getAllReviews() {
    List<EvaluatorReviewResponse> reviews = reviewService.getAllReviews();
    return ResponseEntity.ok(new ApiResponse<>(true, "All reviews fetched successfully", reviews));
}

    @GetMapping("/reviews/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EvaluatorReviewResponse>> getById(
            @PathVariable Long id) {
        EvaluatorReviewResponse review = reviewService.getById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Review fetched successfully", review));
    }

    @PostMapping("/reviews/{id}/decision")
    @PreAuthorize("hasAnyAuthority('ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EvaluatorReviewResponse>> submitDecision(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody DecisionRequest request) {
        Long evaluatorId = (Long) authentication.getPrincipal();
        EvaluatorReviewResponse review = reviewService.submitDecision(id, evaluatorId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Decision submitted successfully", review));
    }

    @GetMapping("/reviews/escalated")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<EvaluatorReviewResponse>>> getEscalatedReviews() {
        List<EvaluatorReviewResponse> reviews = reviewService.getEscalatedReviews();
        return ResponseEntity.ok(new ApiResponse<>(true, "Escalated reviews fetched successfully", reviews));
    }

    @PostMapping("/reviews/{id}/admin-decision")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EvaluatorReviewResponse>> submitAdminDecision(
            @PathVariable Long id,
            @Valid @RequestBody DecisionRequest request) {
        EvaluatorReviewResponse review = reviewService.submitAdminDecision(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin decision submitted successfully", review));
    }

    @PatchMapping("/reviews/{id}/assign")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<EvaluatorReviewResponse>> assignEvaluator(
            @PathVariable Long id,
            @Valid @RequestBody AssignEvaluatorRequest request) {
        EvaluatorReviewResponse review = reviewService.assignEvaluator(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Evaluator assigned successfully", review));
    }

    @PostMapping("/internal/reviews/from-score")
    public ResponseEntity<ApiResponse<EvaluatorReviewResponse>> createFromScore(
            @Valid @RequestBody CreateReviewFromScoreRequest request) {
        EvaluatorReviewResponse review = reviewService.createReviewFromScore(
                request.getExecutionId(),
                request.getStartupUserId(),
                request.getFinancialHealth(),
                request.getTeamStrength(),
                request.getMarketPotential(),
                request.getBusinessViability(),
                request.getOverallScore(),
                request.getClassification(),
                request.getAiReasoning(),
                request.getCompanySize(),
                request.getProblemStatement(),
                request.getBusinessModel(),
                request.getTargetMarket(),
                request.getFundingNeeded()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Review created from score", review));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_EVALUATOR', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            Authentication authentication) {
        Long evaluatorId = (Long) authentication.getPrincipal();

        long totalAssigned = reviewRepository.findByEvaluatorId(evaluatorId).size();
        long pending       = reviewRepository.countByEvaluatorIdAndStatus(evaluatorId, DecisionStatus.PENDING);
        long approved      = reviewRepository.findByEvaluatorIdAndStatus(evaluatorId, DecisionStatus.DECIDED)
                .stream().filter(r -> r.getDecision() == ReviewDecision.APPROVED).count();
        long rejected      = reviewRepository.findByEvaluatorIdAndStatus(evaluatorId, DecisionStatus.DECIDED)
                .stream().filter(r -> r.getDecision() == ReviewDecision.REJECTED).count();
        long escalated     = reviewRepository.findByEvaluatorIdAndStatus(evaluatorId, DecisionStatus.DECIDED)
                .stream().filter(r -> r.getDecision() == ReviewDecision.ESCALATED).count();

        DashboardStatsResponse stats = new DashboardStatsResponse(
                totalAssigned, pending, approved, rejected, escalated);

        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard stats fetched successfully", stats));
    }
}