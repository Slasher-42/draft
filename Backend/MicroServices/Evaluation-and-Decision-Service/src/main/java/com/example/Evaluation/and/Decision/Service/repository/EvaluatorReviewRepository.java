package com.example.Evaluation.and.Decision.Service.repository;

import com.example.Evaluation.and.Decision.Service.enums.DecisionStatus;
import com.example.Evaluation.and.Decision.Service.enums.ReviewDecision;
import com.example.Evaluation.and.Decision.Service.model.EvaluatorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluatorReviewRepository extends JpaRepository<EvaluatorReview, Long> {

    List<EvaluatorReview> findByEvaluatorId(Long evaluatorId);

    List<EvaluatorReview> findByEvaluatorIdAndStatus(Long evaluatorId, DecisionStatus status);

    List<EvaluatorReview> findByStatus(DecisionStatus status);

    Optional<EvaluatorReview> findByExecutionId(Long executionId);

    List<EvaluatorReview> findByDecision(ReviewDecision decision);

    long countByEvaluatorIdAndStatus(Long evaluatorId, DecisionStatus status);

    List<EvaluatorReview> findByEvaluatorIdIsNull();
}