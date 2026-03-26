package com.example.StartupApplicationService.model;

import com.example.StartupApplicationService.enums.ExecutionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "investor_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestorExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String preferredIndustry;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String investmentReason;

    @Column(nullable = false)
    private Double investmentBudget;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedReturnTimeline;

    @Column(columnDefinition = "TEXT")
    private String successCriteria;

    @Column(unique = true)
    private String aiSessionId;

    @Column(columnDefinition = "TEXT")
    private String additionalConsiderations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String statusReason;

    private LocalDateTime statusUpdatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}