package com.example.Evaluation.and.Decision.Service.implementation;

import com.example.Evaluation.and.Decision.Service.dto.request.AssignEvaluatorRequest;
import com.example.Evaluation.and.Decision.Service.dto.request.DecisionRequest;
import com.example.Evaluation.and.Decision.Service.dto.response.EvaluatorReviewResponse;
import com.example.Evaluation.and.Decision.Service.enums.DecisionStatus;
import com.example.Evaluation.and.Decision.Service.exception.ResourceNotFoundException;
import com.example.Evaluation.and.Decision.Service.exception.UnauthorizedException;
import com.example.Evaluation.and.Decision.Service.kafka.EvaluationEventPublisher;
import com.example.Evaluation.and.Decision.Service.model.EvaluatorReview;
import com.example.Evaluation.and.Decision.Service.repository.EvaluatorReviewRepository;
import com.example.Evaluation.and.Decision.Service.service.EvaluatorReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluatorReviewServiceImpl implements EvaluatorReviewService {

    private final EvaluatorReviewRepository reviewRepository;
    private final EvaluationEventPublisher eventPublisher;
    private final WebClient.Builder webClientBuilder;

    @Value("${services.user-management.url}")
    private String userManagementUrl;

    @Override
    public EvaluatorReviewResponse getById(Long id) {
        EvaluatorReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        return toResponse(review);
    }

   @Override
public List<EvaluatorReviewResponse> getMyReviews(Long evaluatorId) {
    return reviewRepository
        .findByEvaluatorIdOrEvaluatorIdIsNull(evaluatorId)
        .stream()
        .map(this::toResponse)
        .toList();
}

    @Override
    public List<EvaluatorReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EvaluatorReviewResponse submitDecision(Long id, Long evaluatorId, DecisionRequest request) {
        EvaluatorReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        if (!review.getEvaluatorId().equals(evaluatorId)) {
            throw new UnauthorizedException("You are not assigned to this review");
        }

        if (review.getStatus() == DecisionStatus.DECIDED) {
            throw new UnauthorizedException("This review has already been decided");
        }

        review.setDecision(request.getDecision());
        review.setReason(request.getReason());
        review.setStatus(DecisionStatus.DECIDED);
        review.setDecidedAt(LocalDateTime.now());

        EvaluatorReview saved = reviewRepository.save(review);

        switch (request.getDecision()) {
            case APPROVED -> eventPublisher.publishStartupApproved(
                    saved.getExecutionId(), saved.getStartupUserId(), saved.getReason());
            case REJECTED -> eventPublisher.publishStartupRejected(
                    saved.getExecutionId(), saved.getStartupUserId(), saved.getReason());
            case ESCALATED -> eventPublisher.publishStartupEscalated(
                    saved.getExecutionId(), saved.getStartupUserId(), saved.getReason());
        }

        eventPublisher.publishEvaluationCompleted(
                saved.getId(), saved.getExecutionId(), saved.getDecision().name());

        return toResponse(saved);
    }

    @Override
    public List<EvaluatorReviewResponse> getEscalatedReviews() {
        return reviewRepository.findByDecision(com.example.Evaluation.and.Decision.Service.enums.ReviewDecision.ESCALATED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EvaluatorReviewResponse submitAdminDecision(Long id, DecisionRequest request) {
        EvaluatorReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        review.setDecision(request.getDecision());
        review.setReason(request.getReason());
        review.setDecidedAt(LocalDateTime.now());
        EvaluatorReview saved = reviewRepository.save(review);

        switch (request.getDecision()) {
            case APPROVED -> eventPublisher.publishStartupApproved(
                    saved.getExecutionId(), saved.getStartupUserId(), saved.getReason());
            case REJECTED -> eventPublisher.publishStartupRejected(
                    saved.getExecutionId(), saved.getStartupUserId(), saved.getReason());
            default -> {}
        }

        eventPublisher.publishEvaluationCompleted(
                saved.getId(), saved.getExecutionId(), saved.getDecision().name());

        return toResponse(saved);
    }

    @Override
    public EvaluatorReviewResponse assignEvaluator(Long id, AssignEvaluatorRequest request) {
        EvaluatorReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        review.setEvaluatorId(request.getEvaluatorId());
        return toResponse(reviewRepository.save(review));
    }

   @Override
public EvaluatorReviewResponse createReviewFromScore(
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
        Double fundingNeeded) {

    EvaluatorReview review = new EvaluatorReview();
    review.setExecutionId(executionId);
    review.setStartupUserId(startupUserId);
    review.setFinancialHealth(financialHealth);
    review.setTeamStrength(teamStrength);
    review.setMarketPotential(marketPotential);
    review.setBusinessViability(businessViability);
    review.setOverallScore(overallScore);
    review.setClassification(classification);
    review.setAiReasoning(aiReasoning);
    review.setCompanySize(companySize);
    review.setProblemStatement(problemStatement);
    review.setBusinessModel(businessModel);
    review.setTargetMarket(targetMarket);
    review.setFundingNeeded(fundingNeeded);

    Long assignedEvaluatorId = fetchLeastLoadedEvaluatorId();
    if (assignedEvaluatorId == null) {
        log.warn("[Review] No evaluator could be assigned for executionId={}. Review saved as unassigned.", executionId);
    }
    review.setEvaluatorId(assignedEvaluatorId); 
    review.setStatus(DecisionStatus.PENDING);

    return toResponse(reviewRepository.save(review));
}
    @Override
    public long countPendingForEvaluator(Long evaluatorId) {
        return reviewRepository.countByEvaluatorIdAndStatus(evaluatorId, DecisionStatus.PENDING);
    }

    private Long fetchLeastLoadedEvaluatorId() {
        try {
            List<Long> evaluatorIds = webClientBuilder.build()
                    .get()
                    .uri(userManagementUrl + "/api/users/internal/evaluator-ids")
                    .retrieve()
                    .bodyToFlux(Long.class)
                    .collectList()
                    .block();

            if (evaluatorIds == null || evaluatorIds.isEmpty()) {
                return null;
            }

            return evaluatorIds.stream()
                    .min(Comparator.comparingLong(id ->
                            reviewRepository.countByEvaluatorIdAndStatus(id, DecisionStatus.PENDING)))
                    .orElse(null);

        } catch (Exception e) {
            System.err.println("[AutoAssign] Could not fetch evaluator IDs: " + e.getMessage());
            return null;
        }
    }

    private EvaluatorReviewResponse toResponse(EvaluatorReview r) {
        EvaluatorReviewResponse response = new EvaluatorReviewResponse();
        response.setId(r.getId());
        response.setExecutionId(r.getExecutionId());
        response.setStartupUserId(r.getStartupUserId());
        response.setEvaluatorId(r.getEvaluatorId());
        response.setFinancialHealth(r.getFinancialHealth());
        response.setTeamStrength(r.getTeamStrength());
        response.setMarketPotential(r.getMarketPotential());
        response.setBusinessViability(r.getBusinessViability());
        response.setOverallScore(r.getOverallScore());
        response.setClassification(r.getClassification());
        response.setAiReasoning(r.getAiReasoning());
        response.setCompanySize(r.getCompanySize());
        response.setProblemStatement(r.getProblemStatement());
        response.setBusinessModel(r.getBusinessModel());
        response.setTargetMarket(r.getTargetMarket());
        response.setFundingNeeded(r.getFundingNeeded());
        response.setDecision(r.getDecision());
        response.setReason(r.getReason());
        response.setStatus(r.getStatus());
        response.setDecidedAt(r.getDecidedAt());
        response.setCreatedAt(r.getCreatedAt());
        response.setUpdatedAt(r.getUpdatedAt());
        return response;
    }
}