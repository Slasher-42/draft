package com.example.Evaluation.and.Decision.Service.model;

import com.example.Evaluation.and.Decision.Service.enums.DecisionStatus;
import com.example.Evaluation.and.Decision.Service.enums.ReviewDecision;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluator_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluatorReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long executionId;


    @Column(nullable = false)
    private Long startupUserId;


    @Column
    private Long evaluatorId;


    @Column(nullable = false)
    private Double financialHealth;

    @Column(nullable = false)
    private Double teamStrength;

    @Column(nullable = false)
    private Double marketPotential;

    @Column(nullable = false)
    private Double businessViability;

    @Column(nullable = false)
    private Double overallScore;

    @Column(nullable = false)
    private String classification;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;

    @Column(columnDefinition = "TEXT")
    private String companySize;

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String businessModel;

    @Column(columnDefinition = "TEXT")
    private String targetMarket;

    @Column
    private Double fundingNeeded;

    @Enumerated(EnumType.STRING)
    @Column
    private ReviewDecision decision;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DecisionStatus status = DecisionStatus.PENDING;

    private LocalDateTime decidedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}